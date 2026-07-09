import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { UsuarioOrmEntity } from './infraestructura/adaptadores-salida/persistencia/postgres/usuario.orm-entity';
import { USUARIO_REPOSITORY } from './aplicacion/puertos/usuario.repository.interface';
import { PostgresUsuarioRepository } from './infraestructura/adaptadores-salida/persistencia/postgres-usuario.repository';
import { RegistrarUsuarioService } from './aplicacion/casos-uso/registrar-usuario.service';
import { AuthController } from './infraestructura/adaptadores-entrada/controladores/auth.controller';
import { LoginService } from './aplicacion/casos-uso/login.service';
import { TOKEN_PROVIDER } from './aplicacion/puertos/token.provider.interface';
import { JwtAdapterService } from './infraestructura/adaptadores-salida/seguridad/jwt-adapter.service';
import { JwtStrategy } from './infraestructura/adaptadores-entrada/guards/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsuarioOrmEntity]),
    PassportModule,
    // Configuracion dinamica del JWT desde el .env
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const secret = configService.get<string>('JWT_SECRET');
        // Se conserva el nombre de variable del equipo: JWT_EXPIRACION (ej. 3600s).
        const expiresIn = configService.get<string>('JWT_EXPIRACION', '7d');

        return {
          secret,
          signOptions: {
            expiresIn: expiresIn as NonNullable<JwtModuleOptions['signOptions']>['expiresIn'],
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: USUARIO_REPOSITORY, useClass: PostgresUsuarioRepository },
    { provide: TOKEN_PROVIDER, useClass: JwtAdapterService },
    RegistrarUsuarioService,
    LoginService,
    JwtStrategy,
  ],
  // Se exportan para que otros modulos (logistica, seguridad) reutilicen
  // los guards JWT y validen el token en sus endpoints protegidos.
  exports: [JwtModule, PassportModule, JwtStrategy, TOKEN_PROVIDER],
})
export class IdentidadModule {}
