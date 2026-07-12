import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UbicacionMongo, UbicacionSchema } from './infraestructura/adaptadores-salida/persistencia/mongo/schemas/ubicacion.schema';
import { UBICACION_REPOSITORY } from './aplicacion/puertos/ubicacion.repository.interface';
import { MongoUbicacionRepository } from './infraestructura/adaptadores-salida/persistencia/mongo/schemas/mongo-ubicacion.repository';
import { ActualizarUbicacionService } from './aplicacion/casos-uso/actualizar-ubicacion.service';
import { ObtenerUbicacionService } from './aplicacion/casos-uso/obtener-ubicacion.service';
import { GpsController } from './infraestructura/adaptadores-entrada/controladores/gps.controller';
import { NOTIFICADOR_UBICACION } from './aplicacion/puertos/notificador-ubicacion.interface';
import { RastreoGateway } from './infraestructura/adaptadores-salida/websockets/rastreo.gateway';
import { EliminarUbicacionesService } from './aplicacion/casos-uso/eliminar-ubicaciones.service';
import { RutaMongo, RutaSchema } from './infraestructura/adaptadores-salida/persistencia/mongo/schemas/ruta.schema';
import { RUTA_REPOSITORY } from './aplicacion/puertos/ruta.repository.interface';
import { MongoRutaRepository } from './infraestructura/adaptadores-salida/persistencia/mongo/schemas/mongo-ruta.repository';
import { RegistrarRutaService } from './aplicacion/casos-uso/registrar-ruta.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UbicacionMongo.name, schema: UbicacionSchema },
      { name: RutaMongo.name, schema: RutaSchema }
    ]),
  ],
  controllers: [
    GpsController, 
  ],
  providers: [
    {
      provide: UBICACION_REPOSITORY,
      useClass: MongoUbicacionRepository,
    },
    {
      provide: NOTIFICADOR_UBICACION,
      useClass: RastreoGateway,
    },
    // Agregamos el repositorio de la ruta
    {
      provide: RUTA_REPOSITORY,
      useClass: MongoRutaRepository,
    },
    ActualizarUbicacionService,
    ObtenerUbicacionService,
    EliminarUbicacionesService,
    // Agregamos el caso de uso de la ruta
    RegistrarRutaService,
  ],
})
export class LogisticaModule {}