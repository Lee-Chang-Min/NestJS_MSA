import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import validationOptions from './utils/validation-options';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 1) class-validator에 Nest DI 컨테이너 연결
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // 보안 관련 미들웨어 생략

  // 2) 글로벌 URL 프리픽스 및 버전링
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix);
  app.enableVersioning({ type: VersioningType.URI });

  // 3) 글로벌 유효성 검사 파이프
  app.useGlobalPipes(new ValidationPipe(validationOptions));

  // 4) 응답 인터셉터 설정
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const port = configService.get<number>('AUTH_PORT') || 3001; // .env 파일의 AUTH_PORT 사용

  await app.listen(port);
  console.log(`Auth server is running on: ${await app.getUrl()}`);
}

void bootstrap();
