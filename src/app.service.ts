import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // Estado del backend (health check) que consume la app movil.
  estado() {
    return {
      servicio: 'RutaSegura API',
      estado: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
