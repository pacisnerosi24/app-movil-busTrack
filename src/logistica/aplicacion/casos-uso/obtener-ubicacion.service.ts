import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UBICACION_REPOSITORY } from '../puertos/ubicacion.repository.interface';
import type { IUbicacionRepository } from '../puertos/ubicacion.repository.interface';

@Injectable()
export class ObtenerUbicacionService {
  constructor(
    @Inject(UBICACION_REPOSITORY)
    private readonly ubicacionRepository: IUbicacionRepository,
  ) {}

  async ejecutar(idBus: string) {
    const bus = await this.ubicacionRepository.obtenerUltimaUbicacion(idBus);

    if (!bus) {
      throw new NotFoundException(`No se encontró ubicación para el bus con ID: ${idBus}`);
    }

    return {
      idBus: bus.idBus,
      latitud: bus.ubicacionActual.latitud,
      longitud: bus.ubicacionActual.longitud,
      ultimaActualizacion: bus.ultimaActualizacion,
      desconectado: bus.estaDesconectado(),
    };
  }
}