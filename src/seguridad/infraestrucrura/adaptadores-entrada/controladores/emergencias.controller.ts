import { Controller, Post, Body, HttpCode, HttpStatus, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import { DispararAlertaService } from '../../../aplicacion/casos-uso/disparar-alerta.service';
import { CrearAlertaDto } from '../dto/crear-alerta.dto';
import { AuthGuard } from '@nestjs/passport'; // Asumiendo que ya tienes JWT configurado

@Controller('api/emergencias')
@UseGuards(AuthGuard('jwt')) // Descomenta esto cuando quieras proteger la ruta de nuevo
export class EmergenciasController {
  constructor(private readonly dispararAlertaService: DispararAlertaService) {}

  @Post('alerta')
  @HttpCode(HttpStatus.CREATED)
  // FileInterceptor('audio') indica que NestJS debe buscar un archivo adjunto llamado "audio"
  @UseInterceptors(FileInterceptor('audio'))
  async reportarEmergencia(
    @Body() body: CrearAlertaDto,
    @UploadedFile() audio?: Express.Multer.File, // Este objeto contiene el Buffer y el nombre del archivo
  ) {
    const alerta = await this.dispararAlertaService.ejecutar(
      body.idBus, 
      body.tipo, 
      audio?.buffer,
      audio?.originalname,
      body.latitud,
      body.longitud  
    );
    
    return {
      mensaje: alerta.activa 
        ? 'Alerta crítica registrada y verificada por IA. Policía notificada.' 
        : 'Falsa alarma. Ruido descartado por la IA.',
      alertaId: alerta.id,
      esCritica: alerta.activa
    };
  }
}