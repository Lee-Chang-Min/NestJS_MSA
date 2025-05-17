import { Controller, Get } from '@nestjs/common';
import { GatewayServerService } from './gateway-server.service';

@Controller()
export class GatewayServerController {
  constructor(private readonly gatewayServerService: GatewayServerService) {}

  @Get()
  getHello(): string {
    return this.gatewayServerService.getHello();
  }
}
