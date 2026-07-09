import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as os from 'os';

// Devuelve las IPs IPv4 de la maquina (WiFi/ethernet) para mostrarlas al
// arrancar: asi sabes que direccion poner en la app movil sin adivinar.
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
    const swaggerPkg = require('@nestjs/swagger') as any;
    const swaggerConfig = new swaggerPkg.DocumentBuilder()
      .setTitle('TransitLive API')
      .setDescription('Documentacion de endpoints principales del backend')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();
    const swaggerDocument = swaggerPkg.SwaggerModule.createDocument(app, swaggerConfig);
    swaggerPkg.SwaggerModule.setup('api/docs', app, swaggerDocument);
  } catch {}

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);

  const localIPs = getLocalIPs();
  logger.log('='.repeat(56));
  logger.log(`  Servidor corriendo en: http://localhost:${port}`);
  localIPs.forEach((ip) => {
    logger.log(`  Acceso local (WiFi):   http://${ip}:${port}`);
  });
  logger.log('  Para acceso remoto (feria/demo):');
  logger.log(`    ngrok http ${port}`);
  logger.log('    Luego pega la URL HTTPS en Ajustes de la app móvil');
  logger.log('='.repeat(56));
}
bootstrap();
