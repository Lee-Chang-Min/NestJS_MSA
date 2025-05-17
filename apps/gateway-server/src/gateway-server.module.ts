import { Module } from '@nestjs/common';
import { GatewayServerController } from './gateway-server.controller';
import { GatewayServerService } from './gateway-server.service';

@Module({
  imports: [],
  controllers: [GatewayServerController],
  providers: [GatewayServerService],
})
export class GatewayServerModule {}
