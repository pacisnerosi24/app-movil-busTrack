import { Controller, Post, Get, Param, Body, HttpCode, HttpStatus, UseGuards, Delete } from '@nestjs/common';
import { ActualizarUbicacionService } from '../../../../logistica/aplicacion/casos-uso/actualizar-ubicacion.service';
import { ObtenerUbicacionService } from '../../../../logistica/aplicacion/casos-uso/obtener-ubicacion.service';
import { CrearUbicacionDto } from '../dto/crear-ubicacion.dto';
import { AuthGuard } from '@nestjs/passport';
import { EliminarUbicacionesService } from '../../../aplicacion/casos-uso/eliminar-ubicaciones.service';
import { RegistrarRutaDto } from '../dto/registrar-ruta.dto';
import { RegistrarRutaService } from '../../../../logistica/aplicacion/casos-uso/registrar-ruta.service';

@Controller('api/gps')
@UseGuards(AuthGuard('jwt'))
export class GpsController {
  constructor(
    private readonly actualizarUbicacionService: ActualizarUbicacionService,
    // Inyectamos el nuevo caso de uso
    private readonly obtenerUbicacionService: ObtenerUbicacionService,
    private readonly eliminarUbicacionesService: EliminarUbicacionesService,
    private readonly registrarRutaService: RegistrarRutaService,
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

  
  @Delete('ubicacion/:idBus')
  @HttpCode(HttpStatus.OK)
  async eliminarUbicaciones(@Param('idBus') idBus: string): Promise<{ mensaje: string }> {
    await this.eliminarUbicacionesService.ejecutar(idBus);
    return { mensaje: `Estado general (ubicación y ruta) del bus ${idBus} reiniciado correctamente` };
  }

  @Post('ruta')
  @HttpCode(HttpStatus.OK)
  async registrarDestinoRuta(@Body() body: RegistrarRutaDto): Promise<{ mensaje: string }> {
    await this.registrarRutaService.ejecutar(body.idBus, body.destinoFinal);
    return { mensaje: 'Destino de ruta registrado correctamente' };
  }
}