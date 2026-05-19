import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    // 페이지 네이션 때 적용 에정F
    // whitelist: true
    // forbidNonWhitelisted: true,
  }))

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
