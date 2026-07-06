import { Injectable, Inject, Logger } from '@nestjs/common';
import { ALERTA_REPOSITORY, type IAlertaRepository } from '../puertos/alerta.repository.interface';
import { Alerta, TipoAlerta } from '../../dominio/entidades/alerta.entity';
import { NivelAudio } from '../../dominio/value-objects/nivel-audio';
import { v4 as uuidv4 } from 'uuid'; 

@Injectable()
export class DispararAlertaService {
  private readonly logger = new Logger(DispararAlertaService.name);

  constructor(
    @Inject(ALERTA_REPOSITORY)
    private readonly alertaRepository: IAlertaRepository,
  ) {}

  async ejecutar(idBus: string, tipo: TipoAlerta, decibeles?: number): Promise<Alerta> {
    const audio = decibeles ? new NivelAudio(decibeles) : undefined;
    const nuevaAlerta = new Alerta(uuidv4(), idBus, tipo, new Date(), true, audio);

    if (nuevaAlerta.esAmenazaCritica()) {
      this.logger.warn(`¡AMENAZA CRÍTICA DETECTADA EN EL BUS ${idBus}! Guardando evidencia...`);
      await this.alertaRepository.guardar(nuevaAlerta);
      
      // En el futuro, aquí inyectaremos un puerto para enviar un SMS a la policía
    } else {
      this.logger.log(`Anomalía descartada en bus ${idBus}. Los decibeles no superaron el umbral.`);
    }

    return nuevaAlerta;
  }
}