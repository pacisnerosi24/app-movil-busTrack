import { Injectable, Inject } from '@nestjs/common';
import { UBICACION_REPOSITORY, type IUbicacionRepository } from '../puertos/ubicacion.repository.interface';
import { Bus } from '../../dominio/entidades/bus.entity';
import { CoordenadaGps } from '../../dominio/value-objects/coordenada-gps';

@Injectable()
export class ActualizarUbicacionService {
  // Aplicamos inyección de dependencias. El servicio no sabe qué base de datos se usa.
  constructor(
    @Inject(UBICACION_REPOSITORY)
    private readonly ubicacionRepository: IUbicacionRepository,
  ) {}

  async ejecutar(idBus: string, latitud: number, longitud: number): Promise<void> {
    const coordenada = new CoordenadaGps(latitud, longitud);
    const busActualizado = new Bus(idBus, coordenada, new Date());
    
    // Aquí el puerto delega la acción a la infraestructura
    await this.ubicacionRepository.guardarUbicacion(busActualizado);
    
    // (En el futuro, aquí también emitiremos el evento por WebSockets)
  }
}