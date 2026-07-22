import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Constants from 'expo-constants';
import {
  AudioModule,
  AudioQuality,
  IOSOutputFormat,
  setAudioModeAsync,
  useAudioRecorder,
  type RecordingOptions,
} from 'expo-audio';
import type { IAudioRecord } from 'react-native-audio-record';
import { analizarAudio } from '../../api';
import { useApp } from '../../AppContext';
import {
  AudioDetectionService,
  base64ToInt16,
  CLIP_SAMPLES,
  CLIP_SECONDS,
  LABELS,
  SAMPLE_RATE,
  type DetectionResult,
  type Label,
} from '../services/AudioDetectionService';

const MAX_HISTORY = 20;

export type ModoDeteccion = 'local' | 'remoto';

// En Expo Go no hay módulos nativos (TFLite): se usa el backend.
// En un development build el análisis corre 100% en el dispositivo.
const ES_EXPO_GO =
  Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';

const OPCIONES_GRABACION: RecordingOptions = {
  extension: '.m4a',
  sampleRate: SAMPLE_RATE,
  numberOfChannels: 1,
  bitRate: 64000,
  android: {
    outputFormat: 'mpeg4',
    audioEncoder: 'aac',
  },
  ios: {
    extension: '.wav',
    outputFormat: IOSOutputFormat.LINEARPCM,
    audioQuality: AudioQuality.HIGH,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

let audioRecord: IAudioRecord | null = null;
function getAudioRecord(): IAudioRecord {
  if (!audioRecord) {
    audioRecord = require('react-native-audio-record').default as IAudioRecord;
  }
  return audioRecord;
}

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pedirPermisoMicrofonoLocal(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: 'Permiso de micrófono',
      message:
        'RutaSegura necesita el micrófono para detectar anomalías auditivas (gritos, peleas, choques).',
      buttonPositive: 'Permitir',
      buttonNegative: 'Cancelar',
    }
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export function useAudioDetection() {
  const { token, rutaSeleccionada } = useApp();
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<DetectionResult | null>(null);
  const [history, setHistory] = useState<DetectionResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const modo: ModoDeteccion = ES_EXPO_GO ? 'remoto' : 'local';

  const recorder = useAudioRecorder(OPCIONES_GRABACION);
  const listeningRef = useRef(false);
  const busyRef = useRef(false);
  const initializedRef = useRef(false);
  const chunksRef = useRef<Int16Array[]>([]);
  const totalSamplesRef = useRef(0);
  const tokenRef = useRef(token);
  const idBusRef = useRef(rutaSeleccionada?.idBus);
  tokenRef.current = token;
  idBusRef.current = rutaSeleccionada?.idBus;

  const publicarResultado = useCallback((result: DetectionResult) => {
    setLastResult(result);
    setHistory((prev) => [result, ...prev].slice(0, MAX_HISTORY));
  }, []);

  // ---- Modo local (development build): TFLite en el dispositivo ----

  const handleChunk = useCallback(
    (base64Chunk: string) => {
      if (!listeningRef.current) return;
      const samples = base64ToInt16(base64Chunk);
      chunksRef.current.push(samples);
      totalSamplesRef.current += samples.length;
      if (totalSamplesRef.current < CLIP_SAMPLES || busyRef.current) return;

      const merged = new Int16Array(totalSamplesRef.current);
      let offset = 0;
      for (const chunk of chunksRef.current) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      chunksRef.current = [];
      totalSamplesRef.current = 0;
      const clip = merged.subarray(merged.length - CLIP_SAMPLES);

      busyRef.current = true;
      setIsProcessing(true);
      AudioDetectionService.detect(clip)
        .then((result) => {
          if (!listeningRef.current) return;
          publicarResultado(result);
        })
        .catch((e: any) => {
          setError(e?.message ?? 'Error al analizar el audio');
        })
        .finally(() => {
          busyRef.current = false;
          setIsProcessing(false);
        });
    },
    [publicarResultado]
  );

  const iniciarLocal = useCallback(async () => {
    const permitido = await pedirPermisoMicrofonoLocal();
    if (!permitido) {
      setError('Permiso de micrófono denegado. Actívalo en Ajustes.');
      return;
    }
    if (!AudioDetectionService.isReady) {
      setIsModelLoading(true);
      await AudioDetectionService.loadModel();
      setIsModelLoading(false);
    }
    if (!initializedRef.current) {
      getAudioRecord().init({
        sampleRate: SAMPLE_RATE,
        channels: 1,
        bitsPerSample: 16,
        audioSource: 6,
        wavFile: 'bustrack_deteccion.wav',
      });
      getAudioRecord().on('data', handleChunk);
      initializedRef.current = true;
    }
    chunksRef.current = [];
    totalSamplesRef.current = 0;
    listeningRef.current = true;
    getAudioRecord().start();
    setIsListening(true);
  }, [handleChunk]);

  // ---- Modo remoto (Expo Go, iOS/Android): graba con expo-audio y analiza en el backend ----

  const cicloRemoto = useCallback(async () => {
    while (listeningRef.current) {
      try {
        await recorder.prepareToRecordAsync(OPCIONES_GRABACION);
        recorder.record();
        await esperar(CLIP_SECONDS * 1000);
        await recorder.stop();
        if (!listeningRef.current) break;

        const uri = recorder.uri;
        if (!uri) continue;

        setIsProcessing(true);
        const r = await analizarAudio(tokenRef.current, uri, idBusRef.current);
        if (!listeningRef.current) break;

        const probabilities = {} as Record<Label, number>;
        for (const label of LABELS) probabilities[label] = r.probabilidades?.[label] ?? 0;
        const etiqueta = (LABELS as readonly string[]).includes(r.etiqueta)
          ? (r.etiqueta as Label)
          : 'normal';

        publicarResultado({
          label: etiqueta,
          confidence: r.confianza,
          isAnomaly: r.esAnomalia,
          probabilities,
          timestamp: Date.now(),
        });
      } catch (e: any) {
        setError(e?.message ?? 'Error al analizar el audio en el servidor');
        await esperar(2000);
      } finally {
        setIsProcessing(false);
      }
    }
  }, [recorder, publicarResultado]);

  const iniciarRemoto = useCallback(async () => {
    const permiso = await AudioModule.requestRecordingPermissionsAsync();
    if (!permiso.granted) {
      setError('Permiso de micrófono denegado. Actívalo en Ajustes.');
      return;
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    listeningRef.current = true;
    setIsListening(true);
    cicloRemoto();
  }, [cicloRemoto]);

  const start = useCallback(async () => {
    if (listeningRef.current) return;
    setError(null);
    try {
      if (modo === 'remoto') {
        await iniciarRemoto();
      } else {
        await iniciarLocal();
      }
    } catch (e: any) {
      setIsModelLoading(false);
      setError(e?.message ?? 'No se pudo iniciar la detección');
    }
  }, [modo, iniciarLocal, iniciarRemoto]);

  const stop = useCallback(() => {
    if (!listeningRef.current) return;
    listeningRef.current = false;
    chunksRef.current = [];
    totalSamplesRef.current = 0;
    setIsListening(false);
    setIsProcessing(false);
    if (modo === 'remoto') {
      recorder.stop().catch(() => {});
    } else if (initializedRef.current) {
      getAudioRecord().stop().catch(() => {});
    }
  }, [modo, recorder]);

  useEffect(() => {
    return () => {
      if (listeningRef.current) {
        listeningRef.current = false;
        if (modo === 'local' && initializedRef.current) {
          getAudioRecord().stop().catch(() => {});
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    modo,
    isModelLoading,
    isListening,
    isProcessing,
    lastResult,
    history,
    error,
    start,
    stop,
  };
}
