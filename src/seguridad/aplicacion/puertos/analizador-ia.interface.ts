export const ANALIZADOR_IA_PORT = Symbol('ANALIZADOR_IA_PORT');

export interface ResultadoIA {
  es_emergencia: boolean;
  similitud: number;
  etiqueta: string;
}

export interface IAnalizadorIA {
  // Recibe el archivo en memoria (Buffer) y su nombre
  analizarAudio(buffer: Buffer, nombreArchivo: string): Promise<ResultadoIA>;
}