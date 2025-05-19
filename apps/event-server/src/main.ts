import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { AllRpcExceptionsFilter } from './common/rpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: new ConfigService().get<number>('EVENT_SERVICE_PORT'),
    },
  });

  app.useGlobalFilters(new AllRpcExceptionsFilter());

  await app.listen();
  Logger.log(`✅ Event server is running TCP port : ${new ConfigService().get<number>('EVENT_SERVICE_PORT')}`);
}

void bootstrap();
