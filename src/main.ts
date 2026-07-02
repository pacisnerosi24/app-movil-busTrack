import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Activa las validaciones de los DTOs en toda la aplicación
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, // Quita cualquier dato extra que el usuario envíe y no esté en el DTO
    forbidNonWhitelisted: true // Lanza error si mandan datos basura
  }));

  await app.listen(3000);
}
bootstrap();