import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: new ConfigService().get<number>('AUTH_SERVICE_PORT'),
    },
  });

  await app.listen();
  Logger.log(`✅ Auth server is running TCP port : ${new ConfigService().get<number>('AUTH_SERVICE_PORT')}`);
}

void bootstrap();
