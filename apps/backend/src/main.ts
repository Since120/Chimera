import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get config service
  const configService = app.get(ConfigService);

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
