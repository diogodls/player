import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser = require('cookie-parser');

const frontendOrigins = Array.from(
  new Set([
    process.env.FRONTEND_URL ?? 'http://localhost:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]),
);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors({
    origin: frontendOrigins,
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();

