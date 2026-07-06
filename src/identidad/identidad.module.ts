import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioOrmEntity } from './infraestructura/adaptadores-salida/persistencia/postgres/usuario.orm-entity';
import { USUARIO_REPOSITORY } from './aplicacion/puertos/usuario.repository.interface';
import { PostgresUsuarioRepository } from './infraestructura/adaptadores-salida/persistencia/postgres-usuario.repository';
import { RegistrarUsuarioService } from './aplicacion/casos-uso/registrar-usuario.service';
import { AuthController } from './infraestructura/adaptadores-entrada/controladores/auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioOrmEntity])],
  controllers: [AuthController],
  providers: [
    {
      provide: USUARIO_REPOSITORY,
      useClass: PostgresUsuarioRepository,
    },
    RegistrarUsuarioService,
  ],
})
export class IdentidadModule {}