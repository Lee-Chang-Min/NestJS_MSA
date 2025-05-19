import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { clientProxyProviders } from './client-proxy.provider';

/**
 * ① @Global() — 한 번만 import해도
 *    애플리케이션 전체에서 AUTH_SERVICE / EVENT_SERVICE
 *    ClientProxy 주입
 *
 * ② ConfigModule — 환경변수(호스트·포트·타임아웃·재시도) 주입
 *
 * ③ providers / exports — clientProxyProviders 배열을
 *    그대로 내보내서 다른 모듈에서 `@Inject(AUTH_SERVICE_TOKEN)` 으로 사용하도록 합니다.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [...clientProxyProviders],
  exports: [...clientProxyProviders],
})
export class ClientsModule {}
