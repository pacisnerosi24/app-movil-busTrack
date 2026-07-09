import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import { IAnalizadorIA, ResultadoIA } from '../../../aplicacion/puertos/analizador-ia.interface';

@Injectable()
export class FastApiAnalizadorService implements IAnalizadorIA {
  private readonly logger = new Logger(FastApiAnalizadorService.name);

  async analizarAudio(buffer: Buffer, nombreArchivo: string): Promise<ResultadoIA> {
    try {
      const formData = new FormData();
      // Adjuntamos el archivo en memoria simulando un formulario HTML
      formData.append('file', buffer, { filename: nombreArchivo, contentType: 'audio/wav' });

      // Consumimos el endpoint de Python (la URL viene del docker-compose.yml)
      const url = `${process.env.URL_MICROSERVICIO_IA}/api/v1/analizar`;
      
      const respuesta = await axios.post<ResultadoIA>(url, formData, {
        headers: formData.getHeaders(),
      });

      return respuesta.data;
    } catch (error) {
      this.logger.error('Error al comunicarse con el microservicio de IA', error);
      throw new InternalServerErrorException('El motor de inteligencia artificial no está disponible.');
    }
  }
}