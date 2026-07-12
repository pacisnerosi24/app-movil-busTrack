import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUbicacionRepository } from '../../../../../aplicacion/puertos/ubicacion.repository.interface';
import { Bus } from '../../../../../dominio/entidades/bus.entity';
import { UbicacionMongo } from '../schemas/ubicacion.schema';
import { CoordenadaGps } from '../../../../../dominio/value-objects/coordenada-gps';

@Injectable()
export class MongoUbicacionRepository implements IUbicacionRepository {
  constructor(
    @InjectModel(UbicacionMongo.name) private readonly ubicacionModel: Model<UbicacionMongo>,
  ) {}

  async guardarUbicacion(bus: Bus): Promise<void> {
    // Mapeamos de Dominio (Bus) a Infraestructura (Mongo)
    await this.ubicacionModel.findOneAndUpdate(
      { idBus: bus.idBus },
      {
        $set: {
          latitud: bus.ubicacionActual.latitud,
          longitud: bus.ubicacionActual.longitud,
          fechaRegistro: bus.ultimaActualizacion,
        }
      },
      { upsert: true, returnDocument: 'after' }
    ).exec();
  }

  async obtenerUltimaUbicacion(idBus: string): Promise<Bus | null> {
    const doc = await this.ubicacionModel.findOne({ idBus }).sort({ fechaRegistro: -1 }).exec();
    if (!doc) return null;
    
    // Mapeamos de Infraestructura (Mongo) a Dominio (Bus)
    return new Bus(doc.idBus, new CoordenadaGps(doc.latitud, doc.longitud), doc.fechaRegistro);
  }

  async eliminarUbicacionesPorBus(idBus: string): Promise<boolean> {
    const resultado = await this.ubicacionModel.deleteMany({ idBus }).exec();
    return resultado.deletedCount > 0;
  }
}