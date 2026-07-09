import { Controller, Post, Get, Param, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ActualizarUbicacionService } from '../../../../logistica/aplicacion/casos-uso/actualizar-ubicacion.service';
import { ObtenerUbicacionService } from '../../../../logistica/aplicacion/casos-uso/obtener-ubicacion.service';
import { CrearUbicacionDto } from '../dto/crear-ubicacion.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/gps')
@UseGuards(AuthGuard('jwt'))
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

  @Get('ubicacion/:idBus')
  async obtenerUbicacion(@Param('idBus') idBus: string) {
    return await this.obtenerUbicacionService.ejecutar(idBus);
  }
}