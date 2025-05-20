import { HttpException, HttpStatus, Logger, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { throwError, Observable } from 'rxjs';
import { timeout, retry, catchError } from 'rxjs/operators';

// 서비스 주입 토큰 정의
export const AUTH_SERVICE_TOKEN = 'AUTH_SERVICE';
export const EVENT_SERVICE_TOKEN = 'EVENT_SERVICE';

// 서비스 타입 정의
export type ServiceType = 'AUTH' | 'EVENT';

const GENERIC_CLIENT_PROXY_LOGGER = new Logger('ClientProxyWithEnhancements');

/**
 * ClientProxy에 타임아웃 및 재시도 기능을 추가하는 함수
 */
/**
 * ClientProxy.send 호출 시 타임아웃 및 재시도 로직을 적용하는 헬퍼 함수.
 * @param client ClientProxy 인스턴스
 * @param pattern 메시지 패턴 (문자열 또는 객체)
 * @param data 전송할 데이터
 * @param options 타임아웃(ms) 및 재시도 횟수 설정
 * @returns Observable<TResult>
 */
interface ClientProxyWith extends ClientProxy {
  clientId?: string;
  port?: string;
}

interface CustomError extends Error {
  error?: {
    result?: string;
    message?: string;
    status?: number;
  };
}

export function sendWithTimeoutAndRetry<TResult = any, TInput = any>(
  client: ClientProxy,
  pattern: string | Record<string, any>,
  data: TInput,
  options?: { timeoutMs?: number; retryAttempts?: number },
): Observable<TResult> {
  const port = (client as ClientProxyWith).port;
  const serviceName = port === '3001' ? 'AUTH-SERVICE' : port === '3002' ? 'EVENT-SERVICE' : 'UnknownService';
  const defaultTimeout = 5000;
  const defaultRetries = 0; // 기본 재시도 0번

  const currentTimeout = options?.timeoutMs ?? defaultTimeout;
  const currentRetryAttempts = options?.retryAttempts ?? defaultRetries;

  GENERIC_CLIENT_PROXY_LOGGER.debug(`Sending message to ${serviceName} with pattern: ${JSON.stringify(pattern)}. retry: ${currentRetryAttempts}`);

  return client.send<TResult, TInput>(pattern, data).pipe(
    timeout({ each: currentTimeout }), // 지정된 시간 내에 응답이 없으면 TimeoutError 발생
    retry({ count: currentRetryAttempts }), // Observable에서 에러 발생 시 지정된 횟수만큼 재구독(재시도)
    catchError((error: CustomError) => {
      GENERIC_CLIENT_PROXY_LOGGER.error(`Failed to send message to ${serviceName} (pattern: ${JSON.stringify(pattern)})`, error.stack);
      // 에러를 그대로 throw하여 전역 RpcExceptionFilter 등에서 처리하도록 함

      const standardError = {
        result: 'fail',
        message: error.message || '서비스 오류가 발생했습니다',
        status: error.error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      };
      const status = standardError.status || HttpStatus.INTERNAL_SERVER_ERROR;

      return throwError(() => new HttpException(standardError, status));
    }),
  );
}

export function enhanceProxy(client: ClientProxy, timeoutMs: number, retryCount: number): ClientProxy {
  const originalSend = client.send.bind(client) as typeof client.send;

  client.send = function <TResult = any, TInput = any>(pattern: string | Record<string, any>, data: TInput): Observable<TResult> {
    return sendWithTimeoutAndRetry<TResult, TInput>({ ...client, send: originalSend } as ClientProxy, pattern, data, {
      timeoutMs,
      retryAttempts: retryCount,
    });
  };
  return client;
}

/**
 * 마이크로서비스 클라이언트 프록시를 생성하는 팩토리 함수
 */
export function createClientProxy(configService: ConfigService, serviceType: ServiceType): ClientProxy {
  const host = configService.get<string>(`${serviceType}_SERVICE_HOST`);
  const port = configService.get<number>(`${serviceType}_SERVICE_PORT`);
  const timeoutMs = configService.get<number>(`GATEWAY_SERVICE_TIMEOUT`, 5000);
  const retryCount = configService.get<number>(`GATEWAY_SERVICE_RETRY_COUNT`, 0); // 특정 경우일때 재시도 로직 적용 (default: 1)

  if (!host || !port) {
    throw new Error(`${serviceType}_SERVICE_HOST 또는 ${serviceType}_SERVICE_PORT 환경 변수가 설정되지 않았습니다.`);
  }

  const client = ClientProxyFactory.create({
    transport: Transport.TCP,
    options: {
      host,
      port,
    },
  });

  return enhanceProxy(client, timeoutMs, retryCount);
}

/**
 * 마이크로서비스 클라이언트 프록시 프로바이더 배열
 */
export const clientProxyProviders: Provider[] = [
  {
    provide: AUTH_SERVICE_TOKEN,
    useFactory: (configService: ConfigService) => createClientProxy(configService, 'AUTH'),
    inject: [ConfigService],
  },
  {
    provide: EVENT_SERVICE_TOKEN,
    useFactory: (configService: ConfigService) => createClientProxy(configService, 'EVENT'),
    inject: [ConfigService],
  },
];
