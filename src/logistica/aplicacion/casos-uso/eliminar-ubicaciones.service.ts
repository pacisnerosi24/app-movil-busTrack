import { Injectable, Inject } from '@nestjs/common';
import { UBICACION_REPOSITORY, type IUbicacionRepository } from '../puertos/ubicacion.repository.interface';
import { RUTA_REPOSITORY, type IRutaRepository } from '../puertos/ruta.repository.interface';

@Injectable()
export class EliminarUbicacionesService {
  constructor(
    @Inject(UBICACION_REPOSITORY)
    private readonly ubicacionRepository: IUbicacionRepository,
    
    @Inject(RUTA_REPOSITORY)
    private readonly rutaRepository: IRutaRepository,
  ) {}

  async ejecutar(idBus: string): Promise<void> {
    // Borramos la ubicación (telemetría)
    await this.ubicacionRepository.eliminarUbicacionesPorBus(idBus);
    
    // Borramos el destino (ruta activa)
    await this.rutaRepository.eliminarRutaPorBus(idBus);
  }
}