import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from './infrastructure/http/domain-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Logger pino como logger de la app.
  app.useLogger(app.get(Logger));

  // Validación automática de DTOs (class-validator) en los endpoints de la
  // próxima etapa. whitelist elimina propiedades no declaradas.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  // Traducción centralizada de errores de dominio a HTTP.
  app.useGlobalFilters(new DomainExceptionFilter());

  // CORS: la app móvil (MAUI) consume esta API desde otro origen.
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('BattleQuiz API')
    .setDescription('API de trivia — NestJS + Prisma + PostgreSQL (Neon)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  // Se cargan los assets de Swagger UI desde un CDN. Detrás del proxy de
  // Render, los estáticos que sirve NestJS por defecto no siempre llegan y la
  // página queda en blanco; apuntando al CDN se resuelve.
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config), {
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.min.js',
    ],
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
