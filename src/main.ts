import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as os from 'os';

function getLocalIPs(): string[] {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];
  for (const name of Object.keys(interfaces)) {
    const net = interfaces[name];
    if (!net) continue;
    for (const addr of net) {
      if (addr.family === 'IPv4' && !addr.internal) {
        ips.push(addr.address);
      }
    }
  }
  return ips;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  try {
    const swaggerPkg = require('@nestjs/swagger') as {
      SwaggerModule: {
        createDocument: (app: unknown, config: unknown) => unknown;
        setup: (path: string, app: unknown, document: unknown) => void;
      };
      DocumentBuilder: new () => {
        setTitle: (title: string) => any;
        setDescription: (description: string) => any;
        setVersion: (version: string) => any;
        addBearerAuth: () => any;
        build: () => unknown;
      };
    };

    const swaggerConfig = new swaggerPkg.DocumentBuilder()
      .setTitle('TransitLive API')
      .setDescription('Documentacion de endpoints principales del backend')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const swaggerDocument = swaggerPkg.SwaggerModule.createDocument(
      app,
      swaggerConfig,
    );
    swaggerPkg.SwaggerModule.setup('api/docs', app, swaggerDocument);
  } catch {
    // Swagger es opcional cuando no hay acceso al registro para instalar dependencias.
  }

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);

  // Mostrar info de red para la app movil
  const localIPs = getLocalIPs();
  logger.log('='.repeat(56));
  logger.log(`  Servidor corriendo en: http://localhost:${port}`);
  if (localIPs.length > 0) {
    localIPs.forEach((ip) => {
      logger.log(`  Acceso local (WiFi):   http://${ip}:${port}`);
    });
  }
  logger.log('  Para acceso remoto (feria/demo):');
  logger.log('    ngrok http ' + port);
  logger.log('    Luego copia la URL HTTPS en Ajustes de la app movil');
  logger.log('='.repeat(56));
}
bootstrap();
