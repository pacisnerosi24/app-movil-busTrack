import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { DispararAlertaService } from '../../../aplicacion/casos-uso/disparar-alerta.service';
import { CrearAlertaDto } from '../dto/crear-alerta.dto';

@Controller('api/emergencias')
export class EmergenciasController {
  constructor(private readonly dispararAlertaService: DispararAlertaService) {}

  @Post('alerta')
  @HttpCode(HttpStatus.CREATED)
  async reportarEmergencia(@Body() body: CrearAlertaDto) {
    const alerta = await this.dispararAlertaService.ejecutar(
      body.idBus, 
      body.tipo, 
      body.decibeles
    );
    
    return {
      mensaje: alerta.esAmenazaCritica() 
        ? 'Alerta crítica registrada. Policía notificada.' 
        : 'Falsa alarma. Ruido descartado.',
      alertaId: alerta.id,
      esCritica: alerta.esAmenazaCritica()
    };
  }
}