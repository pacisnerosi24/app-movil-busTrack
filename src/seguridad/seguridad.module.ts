import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertaOrmEntity } from './infraestrucrura/adaptadores-salida/persistencia/postgres/alerta.orm-entity';
import { ALERTA_REPOSITORY } from './aplicacion/puertos/alerta.repository.interface';
import { PostgresAlertaRepository } from './infraestrucrura/adaptadores-salida/persistencia/postgres/postgres-alerta.repository';
import { DispararAlertaService } from './aplicacion/casos-uso/disparar-alerta.service';
import { EmergenciasController } from './infraestrucrura/adaptadores-entrada/controladores/emergencias.controller';

@Module({
  imports: [
    // Registramos nuestra entidad para que TypeORM cree la tabla 'alertas'
    TypeOrmModule.forFeature([AlertaOrmEntity])
  ],
  controllers: [EmergenciasController],
  providers: [
    {
      provide: ALERTA_REPOSITORY,
      useClass: PostgresAlertaRepository,
    },
    DispararAlertaService,
  ],
  exports: [DispararAlertaService],
})
export class SeguridadModule {}