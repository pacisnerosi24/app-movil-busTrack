import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertaOrmEntity } from './infraestructura/adaptadores-salida/persistencia/postgres/alerta.orm-entity';
import { ALERTA_REPOSITORY } from './aplicacion/puertos/alerta.repository.interface';
import { PostgresAlertaRepository } from './infraestructura/adaptadores-salida/persistencia/postgres/postgres-alerta.repository';
import { DispararAlertaService } from './aplicacion/casos-uso/disparar-alerta.service';
import { EmergenciasController } from './infraestructura/adaptadores-entrada/controladores/emergencias.controller';
import { DETECTOR_ACUSTICO } from './aplicacion/puertos/detector-acustico.interface';
import { HttpDetectorAcusticoAdapter } from './infraestructura/adaptadores-salida/ia/http-detector-acustico.adapter';
import { AnalizarAudioService } from './aplicacion/casos-uso/analizar-audio.service';
import { DeteccionAcusticaController } from './infraestructura/adaptadores-entrada/controladores/deteccion-acustica.controller';

@Module({
  imports: [
    // Registramos nuestra entidad para que TypeORM cree la tabla 'alertas'
    TypeOrmModule.forFeature([AlertaOrmEntity])
  ],
  controllers: [EmergenciasController, DeteccionAcusticaController],
  providers: [
    {
      provide: ALERTA_REPOSITORY,
      useClass: PostgresAlertaRepository,
    },
    {
      provide: DETECTOR_ACUSTICO,
      useClass: HttpDetectorAcusticoAdapter,
    },
    DispararAlertaService,
    AnalizarAudioService,
  ],
  exports: [DispararAlertaService],
})
export class SeguridadModule {}