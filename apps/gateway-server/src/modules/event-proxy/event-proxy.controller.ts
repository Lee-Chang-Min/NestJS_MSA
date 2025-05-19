import { Body, Controller, Post, Logger, UseInterceptors, ClassSerializerInterceptor, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { EVENT_SERVICE_TOKEN } from '../../microservices/client-proxy.provider';
import { ApiTags } from '@nestjs/swagger';

import { CreateEventDto } from '../../../../libs/shared/dto/event/create-event.dto';
import { RolesGuard } from '../../common/guards/role.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../common/decorators/role.enum';

const EVENT_MESSAGE_PATTERNS = {
  CREATE_EVENT: 'event.create',
  FIND_ALL_EVENTS: 'event.findAll',
  FIND_ONE_EVENT: 'event.findOne',
  UPDATE_EVENT: 'event.update',
  DELETE_EVENT: 'event.delete',
};

@ApiTags('Event v1')
@UseInterceptors(ClassSerializerInterceptor)
@Controller({ path: 'events', version: '1' })
export class EventProxyController {
  private readonly logger = new Logger(EventProxyController.name);

  constructor(@Inject(EVENT_SERVICE_TOKEN) private readonly eventClient: ClientProxy) {}

  /**
   * 이벤트 생성
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OPERATOR)
  @Post()
  async createEvent(@Body() createEventDto: CreateEventDto): Promise<{ id: string }> {
    try {
      this.logger.log(`[Gateway] Forwarding 'POST /v1/events' to EVENT_SERVICE`);
      return firstValueFrom(this.eventClient.send(EVENT_MESSAGE_PATTERNS.CREATE_EVENT, createEventDto));
    } catch (error) {
      this.logger.error(`[Gateway] Error creating event: ${error}`);
      throw error;
    }
  }
}
