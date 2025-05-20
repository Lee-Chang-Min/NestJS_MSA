import { Body, Controller, Post, Logger, UseInterceptors, ClassSerializerInterceptor, Req, Get, Param, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { EVENT_SERVICE_TOKEN } from '../../microservices/client-proxy.provider';
import { ApiTags } from '@nestjs/swagger';

import { CreateEventDto } from '../../../../libs/shared/dto/event/create-event.dto';
import { FindEventsQueryDto } from '../../../../libs/shared/dto/event/find-events-query.dto';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../common/decorators/role.enum';
import { EventDocument } from 'apps/event-server/src/event/schemas/event.schema';
import { Public } from '../../common/decorators/public.decorator';

const EVENT_MESSAGE_PATTERNS = {
  CREATE_EVENT: 'event.create',
  FIND_ALL_EVENTS: 'event.findAll',
  FIND_ONE_EVENT: 'event.findOne',
  UPDATE_EVENT: 'event.update',
  DELETE_EVENT: 'event.delete',
};

interface RequestWithUser extends Request {
  user: {
    userID: string;
    role: string;
  };
}

@ApiTags('Event v1')
@UseInterceptors(ClassSerializerInterceptor)
@Controller({ path: 'v1/events', version: '1' })
export class EventProxyController {
  private readonly logger = new Logger(EventProxyController.name);

  constructor(@Inject(EVENT_SERVICE_TOKEN) private readonly eventClient: ClientProxy) {}

  /**
   * 이벤트 생성 => 로그인 + 관리자/운영자만 이벤트 생성 가능
   */
  @Roles(Role.ADMIN, Role.OPERATOR)
  @Post()
  async createEvent(@Body() createEventDto: CreateEventDto, @Req() req: RequestWithUser): Promise<{ result: string; id: string }> {
    try {
      createEventDto.createdBy = req.user.userID;
      this.logger.log(`[Gateway] Forwarding 'POST /v1/events' to EVENT_SERVICE`);
      return firstValueFrom(this.eventClient.send(EVENT_MESSAGE_PATTERNS.CREATE_EVENT, createEventDto));
    } catch (error) {
      this.logger.error(`[Gateway] Error creating event: ${error}`);
      throw error;
    }
  }

  /**
   * 이벤트 상세 조회 => 로그인한 사용자만 이벤트 상세 확인 가능
   */
  @Roles(Role.ADMIN, Role.OPERATOR)
  @Get(':id')
  async findOneEvent(@Param('id') id: string): Promise<{ result: string; data: EventDocument }> {
    try {
      this.logger.log(`[Gateway] Forwarding 'GET /v1/events/:id' to EVENT_SERVICE`);
      return firstValueFrom(this.eventClient.send(EVENT_MESSAGE_PATTERNS.FIND_ONE_EVENT, { id }));
    } catch (error) {
      this.logger.error(`[Gateway] Error finding event: ${error}`);
      throw error;
    }
  }

  /**
   * 이벤트 목록 조회 => 로그인하지 않아도 누구나 이벤트 확인 가능
   */
  @Public()
  @Get()
  async findAllEvents(
    @Query() query: FindEventsQueryDto,
  ): Promise<{ result: string; data: EventDocument[]; total: number; page: number; limit: number }> {
    try {
      this.logger.log(`[Gateway] Forwarding 'GET /v1/events' to EVENT_SERVICE`);
      return firstValueFrom(this.eventClient.send(EVENT_MESSAGE_PATTERNS.FIND_ALL_EVENTS, query));
    } catch (error) {
      this.logger.error(`[Gateway] Error finding all events: ${error}`);
      throw error;
    }
  }
}
