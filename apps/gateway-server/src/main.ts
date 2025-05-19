import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // ConfigService를 사용하기 위해 import
// import { RpcExceptionFilter } from './common/filters/rpc-exception.filter'; // 전역 필터로 사용한다면 import
// import { LoggingInterceptor } from './common/interceptors/logging.interceptor'; // 전역 인터셉터로 사용한다면 import

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Gateway');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('GATEWAY_PORT') || 3000;

  // 전역 API 접두사 설정 (예: /api)
  // app.setGlobalPrefix(apiPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성 자동 제거
      forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 있으면 요청 거부
      transform: true,
    }),
  );

  // CORS 설정 (필요한 경우)
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN') || '*', // .env 또는 특정 도메인
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(port);
  logger.log(`🚀 Gateway Server is running on: http://localhost:${port}`);
  logger.log(`🔗 Auth Service Target: ${configService.get<string>('AUTH_SERVICE_HOST')}:${configService.get<string>('AUTH_SERVICE_PORT')}`);
  logger.log(`🔗 Event Service Target: ${configService.get<string>('EVENT_SERVICE_HOST')}:${configService.get<string>('EVENT_SERVICE_PORT')}`);
}

void bootstrap();
