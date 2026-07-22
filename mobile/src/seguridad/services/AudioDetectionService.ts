import type { TensorflowModel } from 'react-native-fast-tflite';
import modelAsset from '../../assets/models/bustrack_model_int8.tflite';

// Debe coincidir con bustrack-ai/labels.txt y config.txt
export const LABELS = ['normal', 'grito', 'pelea', 'choque'] as const;
export type Label = (typeof LABELS)[number];

export const SAMPLE_RATE = 16000;
export const CLIP_SECONDS = 3;
export const CLIP_SAMPLES = SAMPLE_RATE * CLIP_SECONDS;
export const ANOMALY_THRESHOLD = 0.6;
export const ANOMALY_CLASSES: Label[] = ['grito', 'pelea', 'choque'];

// Parámetros EXACTOS del entrenamiento (Colab). Deben coincidir con
// bustrack-ai/servicio/main.py. Corregidos: antes n_fft=2048 y n_mels=128.
const INPUT_SIZE = 128;
const N_FFT = 1024;
const HOP_LENGTH = 512;
const N_MELS = 64;
const F_MIN = 0;
const F_MAX = 8000;
const TOP_DB = 80;

export interface DetectionResult {
  label: Label;
  confidence: number;
  isAnomaly: boolean;
  probabilities: Record<Label, number>;
  timestamp: number;
}

const B64_LOOKUP = (() => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const table = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) table[chars.charCodeAt(i)] = i;
  return table;
})();

export function base64ToInt16(b64: string): Int16Array {
  let len = b64.length;
  while (len > 0 && b64[len - 1] === '=') len--;
  const byteLen = Math.floor((len * 3) / 4);
  const bytes = new Uint8Array(byteLen + (byteLen % 2));
  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const a = B64_LOOKUP[b64.charCodeAt(i)];
    const b = B64_LOOKUP[b64.charCodeAt(i + 1)];
    const c = i + 2 < len ? B64_LOOKUP[b64.charCodeAt(i + 2)] : 0;
    const d = i + 3 < len ? B64_LOOKUP[b64.charCodeAt(i + 3)] : 0;
    bytes[p++] = (a << 2) | (b >> 4);
    if (p < byteLen) bytes[p++] = ((b & 15) << 4) | (c >> 2);
    if (p < byteLen) bytes[p++] = ((c & 3) << 6) | d;
  }
  return new Int16Array(bytes.buffer, 0, byteLen >> 1);
}

function hzToMel(hz: number): number {
  const fSp = 200 / 3;
  const minLogHz = 1000;
  const minLogMel = minLogHz / fSp;
  const logStep = Math.log(6.4) / 27;
  return hz < minLogHz ? hz / fSp : minLogMel + Math.log(hz / minLogHz) / logStep;
}

function melToHz(mel: number): number {
  const fSp = 200 / 3;
  const minLogHz = 1000;
  const minLogMel = minLogHz / fSp;
  const logStep = Math.log(6.4) / 27;
  return mel < minLogMel ? mel * fSp : minLogHz * Math.exp(logStep * (mel - minLogMel));
}

interface MelFilter {
  start: number;
  weights: Float32Array;
}

function buildMelFilterbank(): MelFilter[] {
  const nBins = N_FFT / 2 + 1;
  const binHz = SAMPLE_RATE / N_FFT;
  const melMin = hzToMel(F_MIN);
  const melMax = hzToMel(F_MAX);
  const hzPoints: number[] = [];
  for (let i = 0; i < N_MELS + 2; i++) {
    hzPoints.push(melToHz(melMin + ((melMax - melMin) * i) / (N_MELS + 1)));
  }
  const filters: MelFilter[] = [];
  for (let m = 0; m < N_MELS; m++) {
    const lower = hzPoints[m];
    const center = hzPoints[m + 1];
    const upper = hzPoints[m + 2];
    const norm = 2 / (upper - lower);
    const start = Math.max(0, Math.floor(lower / binHz));
    const end = Math.min(nBins - 1, Math.ceil(upper / binHz));
    const weights = new Float32Array(Math.max(1, end - start + 1));
    for (let k = start; k <= end; k++) {
      const freq = k * binHz;
      const up = (freq - lower) / Math.max(center - lower, 1e-9);
      const down = (upper - freq) / Math.max(upper - center, 1e-9);
      weights[k - start] = Math.max(0, Math.min(up, down)) * norm;
    }
    filters.push({ start, weights });
  }
  return filters;
}

function fftInPlace(re: Float32Array, im: Float32Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tr = re[i];
      re[i] = re[j];
      re[j] = tr;
      const ti = im[i];
      im[i] = im[j];
      im[j] = ti;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    const half = len >> 1;
    for (let i = 0; i < n; i += len) {
      let curRe = 1;
      let curIm = 0;
      for (let k = 0; k < half; k++) {
        const uRe = re[i + k];
        const uIm = im[i + k];
        const vRe = re[i + k + half] * curRe - im[i + k + half] * curIm;
        const vIm = re[i + k + half] * curIm + im[i + k + half] * curRe;
        re[i + k] = uRe + vRe;
        im[i + k] = uIm + vIm;
        re[i + k + half] = uRe - vRe;
        im[i + k + half] = uIm - vIm;
        const nextRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
      }
    }
  }
}

function reflectPad(signal: Float32Array, pad: number): Float32Array {
  const out = new Float32Array(signal.length + 2 * pad);
  out.set(signal, pad);
  for (let i = 0; i < pad; i++) {
    out[pad - 1 - i] = signal[Math.min(i + 1, signal.length - 1)];
    out[pad + signal.length + i] = signal[Math.max(signal.length - 2 - i, 0)];
  }
  return out;
}

class AudioDetectionServiceImpl {
  private model: TensorflowModel | null = null;
  private melFilterbank: MelFilter[] | null = null;
  private hannWindow: Float32Array | null = null;
  private loadingPromise: Promise<void> | null = null;

  get isReady(): boolean {
    return this.model != null;
  }

  async loadModel(): Promise<void> {
    if (this.model) return;
    if (!this.loadingPromise) {
      this.loadingPromise = import('react-native-fast-tflite')
        .then(({ loadTensorflowModel }) => loadTensorflowModel(modelAsset, []))
        .then((m) => {
          this.model = m;
        })
        .catch((e) => {
          this.loadingPromise = null;
          throw e;
        });
    }
    return this.loadingPromise;
  }

  async detect(pcm: Int16Array): Promise<DetectionResult> {
    if (!this.model) throw new Error('El modelo IA no está cargado');
    const input = this.preprocess(pcm);
    const outputs = await this.model.run([input.buffer as ArrayBuffer]);
    const probabilities = this.decodeOutput(outputs[0]);
    return this.buildResult(probabilities);
  }

  private preprocess(pcm: Int16Array): Float32Array {
    const samples = new Float32Array(CLIP_SAMPLES);
    const n = Math.min(pcm.length, CLIP_SAMPLES);
    for (let i = 0; i < n; i++) samples[i] = pcm[i] / 32768;

    const mel = this.melSpectrogram(samples);
    return this.toModelInput(mel.data, mel.frames);
  }

  private melSpectrogram(samples: Float32Array): { data: Float32Array; frames: number } {
    if (!this.melFilterbank) this.melFilterbank = buildMelFilterbank();
    if (!this.hannWindow) {
      this.hannWindow = new Float32Array(N_FFT);
      for (let i = 0; i < N_FFT; i++) {
        this.hannWindow[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / N_FFT));
      }
    }

    const padded = reflectPad(samples, N_FFT / 2);
    const frames = 1 + Math.floor((padded.length - N_FFT) / HOP_LENGTH);
    const nBins = N_FFT / 2 + 1;
    const re = new Float32Array(N_FFT);
    const im = new Float32Array(N_FFT);
    const power = new Float32Array(nBins);
    const mel = new Float32Array(N_MELS * frames);

    for (let t = 0; t < frames; t++) {
      const offset = t * HOP_LENGTH;
      for (let i = 0; i < N_FFT; i++) {
        re[i] = padded[offset + i] * this.hannWindow[i];
        im[i] = 0;
      }
      fftInPlace(re, im);
      for (let k = 0; k < nBins; k++) power[k] = re[k] * re[k] + im[k] * im[k];
      for (let m = 0; m < N_MELS; m++) {
        const filter = this.melFilterbank[m];
        let sum = 0;
        for (let k = 0; k < filter.weights.length; k++) {
          sum += filter.weights[k] * power[filter.start + k];
        }
        mel[m * frames + t] = sum;
      }
    }

    let maxDb = -Infinity;
    for (let i = 0; i < mel.length; i++) {
      mel[i] = 10 * Math.log10(Math.max(mel[i], 1e-10));
      if (mel[i] > maxDb) maxDb = mel[i];
    }
    for (let i = 0; i < mel.length; i++) {
      const db = Math.max(mel[i] - maxDb, -TOP_DB);
      mel[i] = (db + TOP_DB) / TOP_DB;
    }

    return { data: mel, frames };
  }

  private toModelInput(mel: Float32Array, frames: number): Float32Array {
    const input = new Float32Array(INPUT_SIZE * INPUT_SIZE * 3);
    const melScale = N_MELS > 1 ? (N_MELS - 1) / (INPUT_SIZE - 1) : 0;
    const timeScale = frames > 1 ? (frames - 1) / (INPUT_SIZE - 1) : 0;
    for (let y = 0; y < INPUT_SIZE; y++) {
      const m = y * melScale;
      const m0 = Math.floor(m);
      const m1 = Math.min(m0 + 1, N_MELS - 1);
      const b = m - m0;
      for (let x = 0; x < INPUT_SIZE; x++) {
        const t = x * timeScale;
        const t0 = Math.floor(t);
        const t1 = Math.min(t0 + 1, frames - 1);
        const a = t - t0;
        const v0 = mel[m0 * frames + t0] * (1 - a) + mel[m0 * frames + t1] * a;
        const v1 = mel[m1 * frames + t0] * (1 - a) + mel[m1 * frames + t1] * a;
        const value = v0 * (1 - b) + v1 * b;
        const idx = (y * INPUT_SIZE + x) * 3;
        input[idx] = value;
        input[idx + 1] = value;
        input[idx + 2] = value;
      }
    }
    return input;
  }

  private decodeOutput(buffer: ArrayBuffer): number[] {
    const dataType = this.model?.outputs[0]?.dataType ?? 'float32';
    let values: number[];
    if (dataType === 'uint8') {
      values = Array.from(new Uint8Array(buffer), (v) => v / 255);
    } else if (dataType === 'int8') {
      values = Array.from(new Int8Array(buffer), (v) => (v + 128) / 255);
    } else {
      values = Array.from(new Float32Array(buffer));
    }
    values = values.slice(0, LABELS.length);
    const sum = values.reduce((acc, v) => acc + v, 0);
    return sum > 0 ? values.map((v) => v / sum) : values;
  }

  private buildResult(probs: number[]): DetectionResult {
    const probabilities = {} as Record<Label, number>;
    let best = 0;
    LABELS.forEach((label, i) => {
      probabilities[label] = probs[i] ?? 0;
      if ((probs[i] ?? 0) > (probs[best] ?? 0)) best = i;
    });
    const maxAnomalyProb = Math.max(...ANOMALY_CLASSES.map((c) => probabilities[c]));
    return {
      label: LABELS[best],
      confidence: probabilities[LABELS[best]],
      isAnomaly: maxAnomalyProb >= ANOMALY_THRESHOLD,
      probabilities,
      timestamp: Date.now(),
    };
  }
}

export const AudioDetectionService = new AudioDetectionServiceImpl();
