export const DETECTOR_ACUSTICO = Symbol('DETECTOR_ACUSTICO');

export interface ResultadoDeteccion {
  etiqueta: string;
  confianza: number;
  esAnomalia: boolean;
  probabilidades: Record<string, number>;
}

export interface IDetectorAcustico {
  analizar(audio: Buffer, nombreArchivo: string, tipoContenido: string): Promise<ResultadoDeteccion>;
}
