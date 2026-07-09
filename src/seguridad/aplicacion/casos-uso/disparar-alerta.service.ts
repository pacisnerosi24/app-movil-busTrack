import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { ALERTA_REPOSITORY, type IAlertaRepository } from '../puertos/alerta.repository.interface';
import { ANALIZADOR_IA_PORT, type IAnalizadorIA } from '../puertos/analizador-ia.interface';
import { Alerta, TipoAlerta } from '../../dominio/entidades/alerta.entity';
import { NivelAudio } from '../../dominio/value-objects/nivel-audio';
import { v4 as uuidv4 } from 'uuid'; 

@Injectable()
export class DispararAlertaService {
  private readonly logger = new Logger(DispararAlertaService.name);

  constructor(
    @Inject(ALERTA_REPOSITORY) private readonly alertaRepository: IAlertaRepository,
    @Inject(ANALIZADOR_IA_PORT) private readonly analizadorIA: IAnalizadorIA,
  ) {}

  async ejecutar(idBus: string, tipo: TipoAlerta, audioBuffer?: Buffer, nombreArchivo?: string): Promise<Alerta> {
    let esAmenazaConfirmada = false;
    let detalleAlerta = 'Pánico manual activado';

    if (tipo === 'PANICO_MANUAL') {
      esAmenazaConfirmada = true;
    } else if (tipo === 'IA_ACUSTICO') {
      if (!audioBuffer || !nombreArchivo) {
        throw new BadRequestException('Para alertas acústicas se requiere el archivo de audio.');
      }
      
      // 1. Enviamos el audio a Python
      this.logger.log(`Enviando audio de ${idBus} a la IA para análisis...`);
      const resultadoIA = await this.analizadorIA.analizarAudio(audioBuffer, nombreArchivo);
      
      // 2. Evaluamos la respuesta
      esAmenazaConfirmada = resultadoIA.es_emergencia;
      detalleAlerta = `${resultadoIA.etiqueta} (${resultadoIA.similitud.toFixed(2)}%)`;
      
      if (!esAmenazaConfirmada) {
        this.logger.log(`Descartado en ${idBus}. Ruido normal: ${detalleAlerta}`);
        // No guardamos nada si es falsa alarma (KISS)
        return new Alerta(uuidv4(), idBus, tipo, new Date(), false);
      }
    }

    // 3. Si hay amenaza, creamos la entidad y guardamos en PostgreSQL
    const nuevaAlerta = new Alerta(uuidv4(), idBus, tipo, new Date(), true);
    
    this.logger.warn(`🚨 ¡AMENAZA CRÍTICA REGISTRADA EN EL BUS ${idBus}! Motivo: ${detalleAlerta}`);
    await this.alertaRepository.guardar(nuevaAlerta);

    return nuevaAlerta;
  }
}