import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UbicacionMongo, UbicacionSchema } from './infraestructura/adaptadores-salida/persistencia/mongo/schemas/ubicacion.schema';
import { UBICACION_REPOSITORY } from './aplicacion/puertos/ubicacion.repository.interface';
import { MongoUbicacionRepository } from './infraestructura/adaptadores-salida/persistencia/mongo/schemas/mongo-ubicacion.repository';
import { ActualizarUbicacionService } from './aplicacion/casos-uso/actualizar-ubicacion.service';
import { ObtenerUbicacionService } from './aplicacion/casos-uso/obtener-ubicacion.service';
import { GpsController } from './infraestructura/adaptadores-entrada/controladores/gps.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UbicacionMongo.name, schema: UbicacionSchema }]),
  ],
  controllers: [
    GpsController, // <-- Registramos nuestro nuevo controlador aquí
  ],
  providers: [
    {
      provide: UBICACION_REPOSITORY,
      useClass: MongoUbicacionRepository,
    },
    ActualizarUbicacionService,
    ObtenerUbicacionService,
  ],
  exports: [ActualizarUbicacionService],
})
export class LogisticaModule {}