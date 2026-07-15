import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IDetectorAcustico,
  ResultadoDeteccion,
} from '../../../aplicacion/puertos/detector-acustico.interface';

// Adaptador HTTP hacia el microservicio Python (FastAPI + TFLite) de bustrack-ai.
@Injectable()
export class HttpDetectorAcusticoAdapter implements IDetectorAcustico {
  private readonly logger = new Logger(HttpDetectorAcusticoAdapter.name);

  constructor(private readonly configService: ConfigService) {}

  async analizar(
    audio: Buffer,
    nombreArchivo: string,
    tipoContenido: string,
  ): Promise<ResultadoDeteccion> {
    const base =
      this.configService.get<string>('IA_SERVICE_URL') ?? 'http://localhost:8500';

    const formulario = new FormData();
    formulario.append(
      'audio',
      new Blob([new Uint8Array(audio)], { type: tipoContenido || 'application/octet-stream' }),
      nombreArchivo || 'clip.m4a',
    );

    let respuesta: Response;
    try {
      respuesta = await fetch(`${base}/detectar`, { method: 'POST', body: formulario });
    } catch (error) {
      this.logger.error(`No se pudo contactar al servicio de IA en ${base}`, error as Error);
      throw new ServiceUnavailableException('El servicio de IA acústica no está disponible');
    }

    if (!respuesta.ok) {
      const detalle = await respuesta.text().catch(() => '');
      this.logger.error(`El servicio de IA respondió ${respuesta.status}: ${detalle}`);
      throw new ServiceUnavailableException('El servicio de IA acústica falló al analizar el audio');
    }

    return (await respuesta.json()) as ResultadoDeteccion;
  }
}
