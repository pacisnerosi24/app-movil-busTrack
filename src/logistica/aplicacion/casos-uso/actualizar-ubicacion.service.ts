import { Injectable, Inject } from '@nestjs/common';
import { UBICACION_REPOSITORY, type IUbicacionRepository } from '../puertos/ubicacion.repository.interface';
import { NOTIFICADOR_UBICACION, type INotificadorUbicacion } from '../puertos/notificador-ubicacion.interface';
import { Bus } from '../../dominio/entidades/bus.entity';
import { CoordenadaGps } from '../../dominio/value-objects/coordenada-gps';

@Injectable()
export class ActualizarUbicacionService {
  // Aplicamos inyección de dependencias. El servicio no sabe qué base de datos se usa.
  constructor(
    @Inject(UBICACION_REPOSITORY)
    private readonly ubicacionRepository: IUbicacionRepository,

    @Inject(NOTIFICADOR_UBICACION)
    private readonly notificador: INotificadorUbicacion,
  ) {}

  async ejecutar(idBus: string, latitud: number, longitud: number): Promise<void> {
    const coordenada = new CoordenadaGps(latitud, longitud);
    const busActualizado = new Bus(idBus, coordenada, new Date());
    
    // Aquí el puerto delega la acción a la infraestructura
    await this.ubicacionRepository.guardarUbicacion(busActualizado);
    
    // (En el futuro, aquí también emitiremos el evento por WebSockets)
    this.notificador.notificarNuevaUbicacion(busActualizado);
  }
}