import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { ALERTA_REPOSITORY, type IAlertaRepository } from '../puertos/alerta.repository.interface';
import { ANALIZADOR_IA_PORT, type IAnalizadorIA } from '../puertos/analizador-ia.interface';
import { NOTIFICADOR_PORT, type INotificador } from '../puertos/notificador.interface';
import { Alerta, TipoAlerta } from '../../dominio/entidades/alerta.entity';
import { v4 as uuidv4 } from 'uuid'; 

@Injectable()
export class DispararAlertaService {
  private readonly logger = new Logger(DispararAlertaService.name);

  constructor(
    @Inject(ALERTA_REPOSITORY) private readonly alertaRepository: IAlertaRepository,
    @Inject(ANALIZADOR_IA_PORT) private readonly analizadorIA: IAnalizadorIA,
    @Inject(NOTIFICADOR_PORT) private readonly notificador: INotificador,
  ) {}

  async ejecutar(
    idBus: string, 
    tipo: TipoAlerta, 
    audioBuffer?: Buffer, 
    nombreArchivo?: string,
    latitud?: number, 
    longitud?: number
  ): Promise<Alerta> {
    let esAmenazaConfirmada = false;
    let detalleAlerta = 'Pánico manual activado';

    if (tipo === 'PANICO_MANUAL') {
      esAmenazaConfirmada = true;
    } else if (tipo === 'IA_ACUSTICO') {
      if (!audioBuffer || !nombreArchivo) {
        throw new BadRequestException('Para alertas acústicas se requiere el archivo de audio.');
      }
      
      this.logger.log(`Enviando audio de ${idBus} a la IA para análisis...`);
      const resultadoIA = await this.analizadorIA.analizarAudio(audioBuffer, nombreArchivo);
      
      esAmenazaConfirmada = resultadoIA.es_emergencia;
      detalleAlerta = `${resultadoIA.etiqueta} (${resultadoIA.similitud.toFixed(2)}%)`;
      
      if (!esAmenazaConfirmada) {
        this.logger.log(`Descartado en ${idBus}. Ruido normal: ${detalleAlerta}`);
        return new Alerta(uuidv4(), idBus, tipo, new Date(), false);
      }
    }

    const nuevaAlerta = new Alerta(uuidv4(), idBus, tipo, new Date(), true);
    
    this.logger.warn(`🚨 ¡AMENAZA CRÍTICA REGISTRADA EN EL BUS ${idBus}! Motivo: ${detalleAlerta}`);
    
    // Guardamos en PostgreSQL
    await this.alertaRepository.guardar(nuevaAlerta);

    // Enviamos la alerta a Telegram de forma asíncrona pasando las coordenadas
    await this.notificador.enviarAlertaCritica(idBus, detalleAlerta, latitud, longitud);

    return nuevaAlerta;
  }
}