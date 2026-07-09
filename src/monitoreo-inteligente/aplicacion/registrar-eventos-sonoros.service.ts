import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { EventoMonitoreo } from '../dominio/evento-monitoreo.entity';
// 👇 CAMBIA estos imports a "import type"
import type { PuertoAnalizadorAudio } from './puerto-analizador-audio.interface';
import type { PuertoEventosMonitoreoRepository } from './puerto-eventos-monitoreo.repository.interface';

@Injectable()
export class RegistrarEventosSonorosService {
  constructor(
    private readonly analizadorAudio: PuertoAnalizadorAudio,
    private readonly eventosRepository: PuertoEventosMonitoreoRepository,
  ) {}

  async ejecutar(idBus: string, fragmentoAudio: Buffer): Promise<EventoMonitoreo[]> {
    const resultados = await this.analizadorAudio.detectarEventos(fragmentoAudio);

    const eventos = resultados.map(
      (resultado) =>
        new EventoMonitoreo(
          randomUUID(),
          idBus,
          resultado.tipo,
          resultado.confianza,
          new Date(),
          resultado.metadata,
        ),
    );

    await Promise.all(eventos.map((evento) => this.eventosRepository.guardar(evento)));
    return eventos;
  }
}