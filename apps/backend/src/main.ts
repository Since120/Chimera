import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { CustomLoggerService } from './core/logger/custom-logger.service';

async function bootstrap() {
  // Erstelle einen benutzerdefinierten Logger
  const logger = new CustomLoggerService();

  // Erstelle die App mit dem benutzerdefinierten Logger
  const app = await NestFactory.create(AppModule, {
    logger,
  });

  // Get config service
  const configService = app.get(ConfigService);

  // Hole das Log-Level aus der Konfiguration und aktualisiere den Logger
  const logLevelStr = configService.get<string>('LOG_LEVEL', 'log');
  logger.setLogLevels(logLevelStr);
  console.log(`Application log level: ${logLevelStr}`);

  // Enable CORS for frontend with specific configuration
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3001');
  console.log(`Configuring CORS to allow requests from: ${frontendUrl}`);

  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Important for cookies/auth headers
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Get port from config
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
