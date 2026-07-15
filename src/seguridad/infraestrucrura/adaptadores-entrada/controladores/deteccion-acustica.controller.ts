import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { AnalizarAudioService } from '../../../aplicacion/casos-uso/analizar-audio.service';

@Controller('api/seguridad')
@UseGuards(AuthGuard('jwt'))
export class DeteccionAcusticaController {
  constructor(private readonly analizarAudioService: AnalizarAudioService) {}

  @Post('deteccion-audio')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('audio', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async detectar(
    @UploadedFile() archivo: Express.Multer.File,
    @Body('idBus') idBus?: string,
  ) {
    if (!archivo) {
      throw new BadRequestException('Falta el archivo de audio (campo "audio")');
    }
    return this.analizarAudioService.ejecutar(
      archivo.buffer,
      archivo.originalname,
      archivo.mimetype,
      idBus,
    );
  }
}
