import logging
import os
import subprocess
import tempfile

import numpy as np
import soundfile as sf
import librosa
from fastapi import FastAPI, File, HTTPException, UploadFile

try:
    from tflite_runtime.interpreter import Interpreter
except ImportError:  # pragma: no cover
    from tensorflow.lite.python.interpreter import Interpreter

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s [%(name)s] %(message)s")
logger = logging.getLogger("bustrack-ia")

# Debe coincidir con bustrack-ai/config.txt
LABELS = ["normal", "grito", "pelea", "choque"]
CLASES_ANOMALIA = {"grito", "pelea", "choque"}
UMBRAL_ANOMALIA = 0.6

# =====================================================================
# Parámetros EXACTOS del entrenamiento (Colab). NO cambiar sin reentrenar.
#
# CORRECCIÓN: antes este servicio usaba n_fft=2048 y n_mels=128, que NO
# coinciden con el entrenamiento y degradaban la precisión del modelo.
#   n_fft:  2048 -> 1024
#   n_mels:  128 -> 64
# Además ahora se redimensiona el espectrograma en AMBOS ejes
# (64 mels x ~94 frames -> 128 x 128), como en el entrenamiento.
# =====================================================================
SAMPLE_RATE = 16000   # SR
DURACION_SEG = 3.0    # duración del clip
N_FFT = 1024          # CORREGIDO (era 2048)
HOP_LENGTH = 512
N_MELS = 64           # CORREGIDO (era 128)
FMIN = 0
FMAX = 8000
IMG_SIZE = (128, 128) # (alto, ancho) de la imagen de entrada del modelo
TOP_DB = 80

RUTA_MODELO = os.environ.get("MODELO", os.path.join(os.path.dirname(__file__), "bustrack_model_int8.tflite"))

interpreter = Interpreter(model_path=RUTA_MODELO)
interpreter.allocate_tensors()
detalle_entrada = interpreter.get_input_details()[0]
detalle_salida = interpreter.get_output_details()[0]
logger.info(
    "Modelo cargado: %s | entrada %s %s | salida %s %s",
    os.path.basename(RUTA_MODELO),
    detalle_entrada["shape"], detalle_entrada["dtype"].__name__,
    detalle_salida["shape"], detalle_salida["dtype"].__name__,
)

app = FastAPI(title="BusTrack - IA Acustica", version="1.1.0")


def cargar_audio(datos: bytes, nombre: str) -> np.ndarray:
    """Convierte cualquier formato (wav/m4a/3gp/webm) a PCM mono 16 kHz usando ffmpeg."""
    sufijo = os.path.splitext(nombre or "")[1] or ".bin"
    with tempfile.TemporaryDirectory() as tmp:
        origen = os.path.join(tmp, f"entrada{sufijo}")
        destino = os.path.join(tmp, "clip.wav")
        with open(origen, "wb") as f:
            f.write(datos)
        resultado = subprocess.run(
            ["ffmpeg", "-y", "-i", origen, "-ac", "1", "-ar", str(SAMPLE_RATE), destino],
            capture_output=True,
        )
        if resultado.returncode != 0:
            raise HTTPException(status_code=400, detail="No se pudo decodificar el audio")
        y, _ = sf.read(destino, dtype="float32")

    objetivo = int(SAMPLE_RATE * DURACION_SEG)
    if len(y) < objetivo:
        y = np.pad(y, (0, objetivo - len(y)))
    else:
        y = y[-objetivo:]
    return y


def _redimensionar_bilineal(matriz: np.ndarray, alto: int, ancho: int) -> np.ndarray:
    """Redimensiona una matriz 2D con interpolación bilineal (separable, sin cv2)."""
    x_orig = np.linspace(0.0, 1.0, matriz.shape[1])
    x_nuevo = np.linspace(0.0, 1.0, ancho)
    temporal = np.stack([np.interp(x_nuevo, x_orig, fila) for fila in matriz])

    y_orig = np.linspace(0.0, 1.0, temporal.shape[0])
    y_nuevo = np.linspace(0.0, 1.0, alto)
    return np.stack(
        [np.interp(y_nuevo, y_orig, temporal[:, col]) for col in range(temporal.shape[1])],
        axis=1,
    )


def audio_a_espectrograma(y: np.ndarray) -> np.ndarray:
    """Genera la entrada del modelo (1, 128, 128, 3) con los parámetros del entrenamiento."""
    mel = librosa.feature.melspectrogram(
        y=y,
        sr=SAMPLE_RATE,
        n_fft=N_FFT,          # 1024 (corregido)
        hop_length=HOP_LENGTH,
        n_mels=N_MELS,        # 64 (corregido)
        fmin=FMIN,
        fmax=FMAX,
    )
    db = librosa.power_to_db(mel, ref=np.max, top_db=TOP_DB)
    norm = (db + TOP_DB) / TOP_DB  # [0, 1]

    logger.info("Espectrograma mel crudo: %s (mels x frames)", norm.shape)

    # CORREGIDO: se redimensionan ambos ejes (antes solo el temporal)
    redimensionado = _redimensionar_bilineal(norm, IMG_SIZE[0], IMG_SIZE[1])
    imagen = np.repeat(redimensionado[:, :, None], 3, axis=2).astype(np.float32)

    # Validación de dimensiones: debe ser exactamente (128, 128, 3)
    if imagen.shape != (IMG_SIZE[0], IMG_SIZE[1], 3):
        logger.error("Espectrograma con dimensión inválida: %s", imagen.shape)
        raise HTTPException(
            status_code=500,
            detail=f"Espectrograma inválido {imagen.shape}, se esperaba {(IMG_SIZE[0], IMG_SIZE[1], 3)}",
        )
    logger.info("Espectrograma final: %s", imagen.shape)

    return imagen[None, ...]


def inferir(imagen: np.ndarray) -> np.ndarray:
    if detalle_entrada["dtype"] == np.float32:
        interpreter.set_tensor(detalle_entrada["index"], imagen)
    else:
        escala, punto_cero = detalle_entrada["quantization"]
        cuantizada = np.round(imagen / escala + punto_cero).astype(detalle_entrada["dtype"])
        interpreter.set_tensor(detalle_entrada["index"], cuantizada)

    interpreter.invoke()
    salida = interpreter.get_tensor(detalle_salida["index"])[0]

    if detalle_salida["dtype"] != np.float32:
        escala, punto_cero = detalle_salida["quantization"]
        salida = (salida.astype(np.float32) - punto_cero) * escala

    total = float(salida.sum())
    if total > 0:
        salida = salida / total
    return salida


@app.get("/salud")
def salud():
    return {
        "estado": "ok",
        "modelo": os.path.basename(RUTA_MODELO),
        "etiquetas": LABELS,
        "umbralAnomalia": UMBRAL_ANOMALIA,
        "parametros": {
            "sr": SAMPLE_RATE,
            "n_fft": N_FFT,
            "n_mels": N_MELS,
            "hop_length": HOP_LENGTH,
            "fmin": FMIN,
            "fmax": FMAX,
            "img_size": IMG_SIZE,
            "duracion": DURACION_SEG,
        },
    }


@app.post("/detectar")
async def detectar(audio: UploadFile = File(...)):
    datos = await audio.read()
    if not datos:
        raise HTTPException(status_code=400, detail="El archivo de audio está vacío")

    logger.info("Audio recibido: %s (%d bytes)", audio.filename, len(datos))

    y = cargar_audio(datos, audio.filename or "clip")
    logger.info("Audio decodificado: %d muestras (%.2f s @ %d Hz)", len(y), len(y) / SAMPLE_RATE, SAMPLE_RATE)

    probabilidades_arr = inferir(audio_a_espectrograma(y))

    probabilidades = {etiqueta: float(p) for etiqueta, p in zip(LABELS, probabilidades_arr)}
    indice = int(np.argmax(probabilidades_arr))
    max_anomalia = max(probabilidades[c] for c in CLASES_ANOMALIA)

    logger.info(
        "Predicción: %s (%.1f%%) | esAnomalia=%s | %s",
        LABELS[indice],
        probabilidades_arr[indice] * 100,
        max_anomalia >= UMBRAL_ANOMALIA,
        {k: round(v, 3) for k, v in probabilidades.items()},
    )

    # Se mantiene este esquema porque el backend NestJS y la app móvil dependen de él.
    return {
        "etiqueta": LABELS[indice],
        "confianza": float(probabilidades_arr[indice]),
        "esAnomalia": max_anomalia >= UMBRAL_ANOMALIA,
        "probabilidades": probabilidades,
    }
