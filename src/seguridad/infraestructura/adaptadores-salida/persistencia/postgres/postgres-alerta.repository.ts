import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAlertaRepository } from '../../../../aplicacion/puertos/alerta.repository.interface';
import { Alerta, TipoAlerta } from '../../../../dominio/entidades/alerta.entity';
import { NivelAudio } from '../../../../dominio/value-objects/nivel-audio';
import { AlertaOrmEntity } from './alerta.orm-entity';

@Injectable()
export class PostgresAlertaRepository implements IAlertaRepository {
  constructor(
    @InjectRepository(AlertaOrmEntity)
    private readonly repository: Repository<AlertaOrmEntity>,
  ) {}

  async guardar(alerta: Alerta): Promise<void> {
    // 1. Traducir (Mapear) de Dominio a Infraestructura
    const entidadDb = this.repository.create({
      id: alerta.id,
      idBus: alerta.idBus,
      tipo: alerta.tipo,
      decibeles: alerta.nivelAudio ? alerta.nivelAudio.decibeles : null,
      fechaHora: alerta.fechaHora,
      activa: alerta.activa,
    });
    
    // 2. Guardar en Postgres
    await this.repository.save(entidadDb);
  }

  async obtenerAlertasActivas(): Promise<Alerta[]> {
    const alertasDb = await this.repository.find({ where: { activa: true } });
    
    // 3. Traducir (Mapear) de vuelta al Dominio antes de enviarlo a la aplicación
    return alertasDb.map(orm => new Alerta(
      orm.id,
      orm.idBus,
      orm.tipo as TipoAlerta,
      orm.fechaHora,
      orm.activa,
      orm.decibeles ? new NivelAudio(orm.decibeles) : undefined
    ));
  }
}