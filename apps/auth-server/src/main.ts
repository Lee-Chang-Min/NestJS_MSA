import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { Logger, ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import validationOptions from './utils/validation-options';
import helmet from 'helmet';
import * as compression from 'compression';
import * as morgan from 'morgan';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 1) class-validator에 Nest DI 컨테이너 연결
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.use(helmet());
  app.use(compression());
  app.use(morgan('combined'));
  app.use(cookieParser());

  // 2) 글로벌 URL 프리픽스
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix);

  // 3) 글로벌 유효성 검사 파이프
  app.useGlobalPipes(new ValidationPipe(validationOptions));

  // 4) 응답 인터셉터 설정
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const port = configService.get<number>('AUTH_PORT') || 3001; // .env 파일의 AUTH_PORT 사용

  await app.listen(port);
  Logger.log(`Auth server is running on: ${await app.getUrl()}`);
}

void bootstrap();
