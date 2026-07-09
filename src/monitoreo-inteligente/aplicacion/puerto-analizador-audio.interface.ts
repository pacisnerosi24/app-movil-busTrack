import { TipoEventoEmergencia } from '../dominio/tipos-evento-emergencia';

export interface ResultadoAnalisisAudio {
  tipo: TipoEventoEmergencia;
  confianza: number;
  metadata?: Record<string, unknown>;
}

export interface PuertoAnalizadorAudio {
  detectarEventos(fragmentoAudio: Buffer): Promise<ResultadoAnalisisAudio[]>;
}
