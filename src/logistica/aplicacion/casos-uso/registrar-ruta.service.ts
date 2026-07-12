import { Injectable, Inject } from '@nestjs/common';
import { RUTA_REPOSITORY, type IRutaRepository } from '../puertos/ruta.repository.interface';
import { Ruta } from '../../dominio/entidades/ruta.entity';

@Injectable()
export class RegistrarRutaService {
  constructor(
    @Inject(RUTA_REPOSITORY)
    private readonly rutaRepository: IRutaRepository,
  ) {}

  async ejecutar(idBus: string, destinoFinal: string): Promise<void> {
    const nuevaRuta = new Ruta(idBus, destinoFinal);
    await this.rutaRepository.guardarRuta(nuevaRuta);
  }
}