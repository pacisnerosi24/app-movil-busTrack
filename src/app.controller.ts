import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Health check: la app movil (pantalla de Ajustes) lo usa para
  // verificar que la URL del backend responde antes de guardarla.
  @Get()
  estado() {
    return this.appService.estado();
  }
}
