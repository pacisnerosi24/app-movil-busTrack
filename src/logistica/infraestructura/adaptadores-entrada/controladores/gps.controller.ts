import { Controller, Post, Get, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ActualizarUbicacionService } from '../../../../logistica/aplicacion/casos-uso/actualizar-ubicacion.service';
import { ObtenerUbicacionService } from '../../../../logistica/aplicacion/casos-uso/obtener-ubicacion.service';
import { CrearUbicacionDto } from '../dto/crear-ubicacion.dto';

@Controller('api/gps')
export class GpsController {
  constructor(
    private readonly actualizarUbicacionService: ActualizarUbicacionService,
    // Inyectamos el nuevo caso de uso
    private readonly obtenerUbicacionService: ObtenerUbicacionService,
  ) {}

  @Post('ubicacion')
  @HttpCode(HttpStatus.OK)
  async registrarUbicacion(@Body() body: CrearUbicacionDto): Promise<{ mensaje: string }> {
    await this.actualizarUbicacionService.ejecutar(body.idBus, body.latitud, body.longitud);
    return { mensaje: 'Ubicación actualizada correctamente' };
  }

  // NUEVO ENDPOINT GET: Recibe el ID del bus por la URL
  @Get('ubicacion/:idBus')
  async obtenerUbicacion(@Param('idBus') idBus: string) {
    return await this.obtenerUbicacionService.ejecutar(idBus);
  }
}