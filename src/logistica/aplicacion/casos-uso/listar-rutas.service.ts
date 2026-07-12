import { Injectable, Inject } from '@nestjs/common';
import { RUTA_REPOSITORY, type IRutaRepository } from '../puertos/ruta.repository.interface';

@Injectable()
export class ListarRutasService {
  constructor(
    @Inject(RUTA_REPOSITORY)
    private readonly rutaRepository: IRutaRepository,
  ) {}

  async ejecutar() {
    const rutas = await this.rutaRepository.obtenerTodasLasRutas();
    
    // Podemos devolver un formato limpio para el frontend
    return rutas.map(ruta => ({
      idBus: ruta.idBus,
      destinoFinal: ruta.destinoFinal,
      activa: ruta.activa,
    }));
  }
}