import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Cookie parser for JWT httpOnly cookies
  app.use(cookieParser());

  const globalPrefix = process.env.API_PREFIX || 'api';
  app.setGlobalPrefix(globalPrefix);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: true, // Required for cookies
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const config = new DocumentBuilder()
    .setTitle('MiniPaint Pro API')
    .setDescription('API for tracking miniature painting progress')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('miniatures')
    .addTag('armies')
    .addTag('paints')
    .addTag('recipes')
    .addTag('progress')
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(
    `Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(`Swagger docs available at: http://localhost:${port}/docs`);
}

bootstrap();
