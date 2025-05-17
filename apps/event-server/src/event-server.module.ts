import { Module } from '@nestjs/common';
import { EventServerController } from './event-server.controller';
import { EventServerService } from './event-server.service';

@Module({
  imports: [],
  controllers: [EventServerController],
  providers: [EventServerService],
})
export class EventServerModule {}
