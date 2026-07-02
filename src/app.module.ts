import { Module, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { DataSource } from 'typeorm';
import { Connection } from 'mongoose';

// Tus módulos internos
import { IdentidadModule } from './identidad/identidad.module';
import { LogisticaModule } from './logistica/logistica.module';
import { SeguridadModule } from './seguridad/seguridad.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuración de PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        autoLoadEntities: true,
        synchronize: true, 
      }),
    }),

    // Configuración de MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),

    IdentidadModule,
    LogisticaModule,
    SeguridadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements OnApplicationBootstrap {
  // Instanciamos el logger nativo de NestJS
  private readonly logger = new Logger('DatabaseConnections');

  // Inyectamos las conexiones de ambas bases de datos
  constructor(
    private readonly dataSource: DataSource, // Inyección de TypeORM (Postgres)
    @InjectConnection() private readonly mongoConnection: Connection, // Inyección de Mongoose (Mongo)
  ) {}

  // Este método se ejecuta automáticamente cuando la app termina de arrancar
  onApplicationBootstrap() {
    // 1. Verificación de PostgreSQL
    if (this.dataSource.isInitialized) {
      this.logger.log('✅ PostgreSQL conectado exitosamente [TypeORM]');
    } else {
      this.logger.error('❌ Fallo al verificar la conexión de PostgreSQL');
    }

    // 2. Verificación de MongoDB
    // readyState en Mongoose: 0 = desconectado, 1 = conectado, 2 = conectando, 3 = desconectando
    if (this.mongoConnection.readyState === 1) {
      this.logger.log('✅ MongoDB conectado exitosamente [Mongoose]');
    } else {
      this.logger.error(`❌ Fallo en MongoDB. Código de estado: ${this.mongoConnection.readyState}`);
    }
  }
}