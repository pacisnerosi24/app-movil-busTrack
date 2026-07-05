import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { INotificadorUbicacion } from '../../../aplicacion/puertos/notificador-ubicacion.interface';
import { Bus } from '../../../dominio/entidades/bus.entity';

// Habilitamos CORS para que la app móvil (React Native/Expo) pueda conectarse
@WebSocketGateway({ cors: { origin: '*' } })
export class RastreoGateway implements INotificadorUbicacion {
  
  @WebSocketServer()
  server!: Server;

  // Implementamos el método de la interfaz
  notificarNuevaUbicacion(bus: Bus): void {
    // Creamos un payload limpio para el frontend
    const payload = {
      idBus: bus.idBus,
      latitud: bus.ubicacionActual.latitud,
      longitud: bus.ubicacionActual.longitud,
      fecha: bus.ultimaActualizacion,
    };

    // Emitimos el evento a todos los clientes. 
    // Usamos el ID del bus como nombre del evento para que el pasajero solo escuche su bus.
    this.server.emit(`bus_${bus.idBus}`, payload);
  }
}