import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IRutaRepository } from '../../../../../aplicacion/puertos/ruta.repository.interface';
import { Ruta } from '../../../../../dominio/entidades/ruta.entity';
import { RutaMongo } from './ruta.schema';

@Injectable()
export class MongoRutaRepository implements IRutaRepository {
  constructor(
    @InjectModel(RutaMongo.name) private readonly rutaModel: Model<RutaMongo>,
  ) {}

  async guardarRuta(ruta: Ruta): Promise<void> {
    await this.rutaModel.findOneAndUpdate(
      { idBus: ruta.idBus },
      { 
        $set: { 
          destinoFinal: ruta.destinoFinal,
          activa: ruta.activa 
        } 
      },
      { upsert: true, returnDocument: 'after' }
    ).exec();
  }

  async eliminarRutaPorBus(idBus: string): Promise<void> {
    await this.rutaModel.deleteMany({ idBus }).exec();
  }
}