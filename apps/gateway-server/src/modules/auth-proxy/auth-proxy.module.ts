import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '../../microservices/client.module';
import { AuthProxyController } from './auth-proxy.controller';

/**
 * AuthProxyModule
 * ────────────────────────────────────────────
 * 1) Gateway ⇄ Auth-Service 프록시 라우터만 책임
 * 2) 실제 RPC ClientProxy(AUTH_SERVICE_TOKEN)는
 *    ClientsModule(Global)이 이미 제공하므로
 *    여기서는 별도 provider · import 가 필요 없다.
 */
@Module({
  imports: [
    ClientsModule, // AuthProxyController에서 AUTH_SERVICE_TOKEN으로 ClientProxy를 주입받기 위해 필요합니다.
    ConfigModule,
  ],
  controllers: [AuthProxyController], // 이 모듈에서 사용할 컨트롤러를 등록합니다.
  providers: [
    // 이 모듈에서만 사용될 특정 서비스가 있다면 여기에 등록
  ],
})
export class AuthProxyModule {}
