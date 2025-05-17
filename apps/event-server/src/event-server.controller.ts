import { Controller, Get } from '@nestjs/common';
import { EventServerService } from './event-server.service';

@Controller()
export class EventServerController {
  constructor(private readonly eventServerService: EventServerService) {}

  @Get()
  getHello(): string {
    return this.eventServerService.getHello();
  }
}
