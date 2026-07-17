import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');

// Last-resort safety net: catch any unhandled promise rejection that escapes
// module-level try-catches (e.g. EventEmitter 'error' events from DB pools).
// Without this, Node.js crashes the entire process.
process.on('unhandledRejection', (reason: unknown) => {
  logger.error(
    `Unhandled promise rejection caught at process level: ${String(reason)}`,
  );
});

process.on('uncaughtException', (error: Error) => {
  logger.error(`Uncaught exception caught at process level: ${error.message}`, error.stack);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:4200',
      'http://localhost:4321',
      'https://lacasona-restaurants.vercel.app',
      'https://admin-menu-seven.vercel.app',
      'https://admin-menu-seven.vercel.app/dashboard',
    ],
    credentials: true,
  });

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Tinyafood API')
    .setDescription('The Tinyafood backend API specifications')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation is available at: http://localhost:${port}/api`);
}

bootstrap().catch((error: Error) => {
  logger.error(`Fatal error during bootstrap: ${error.message}`, error.stack);
  process.exit(1);
});

