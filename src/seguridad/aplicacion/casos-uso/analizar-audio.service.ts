import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  DETECTOR_ACUSTICO,
  type IDetectorAcustico,
  type ResultadoDeteccion,
} from '../puertos/detector-acustico.interface';

// Caso de uso: analizar un clip de audio del bus con el modelo de IA
// para detectar anomalías auditivas (grito, pelea, choque).
@Injectable()
export class AnalizarAudioService {
  private readonly logger = new Logger(AnalizarAudioService.name);

  constructor(
    @Inject(DETECTOR_ACUSTICO)
    private readonly detectorAcustico: IDetectorAcustico,
  ) {}

  async ejecutar(
    audio: Buffer,
    nombreArchivo: string,
    tipoContenido: string,
    idBus?: string,
  ): Promise<ResultadoDeteccion> {
    const resultado = await this.detectorAcustico.analizar(audio, nombreArchivo, tipoContenido);

    if (resultado.esAnomalia) {
      this.logger.warn(
        `¡Anomalía acústica detectada${idBus ? ` en el bus ${idBus}` : ''}!: ` +
          `${resultado.etiqueta} (${(resultado.confianza * 100).toFixed(1)}%)`,
      );
    }

    return resultado;
  }
}
