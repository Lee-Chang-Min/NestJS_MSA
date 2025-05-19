import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '../../microservices/client.module';
import { EventProxyController } from './event-proxy.controller';

/**
 * EventProxyModule
 * ────────────────────────────────────────────
 * 1) Gateway ⇄ Event-Service 프록시 라우터만 책임
 * 2) 실제 RPC ClientProxy(EVENT_SERVICE_TOKEN)는
 *    ClientsModule(Global)이 이미 제공하므로
 *    여기서는 별도 provider · import 가 필요 없다.
 */
@Module({
  imports: [ClientsModule, ConfigModule],
  controllers: [EventProxyController],
  providers: [
    // 이 모듈에서만 사용될 특정 서비스가 있다면 여기에 등록
  ],
})
export class EventProxyModule {}
