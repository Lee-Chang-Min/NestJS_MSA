import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { FindEventsQueryDto } from './dto/find-events-query.dto';
import { EventDocument } from './schemas/event.schema';

const EVENT_MESSAGE_PATTERNS = {
  CREATE_EVENT: 'event.create',
  FIND_ALL_EVENTS: 'event.findAll',
  FIND_ONE_EVENT: 'event.findOne',
  UPDATE_EVENT: 'event.update',
  DELETE_EVENT: 'event.delete',
};

@Controller()
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly eventService: EventService) {}

  // 이벤트 생성
  @MessagePattern(EVENT_MESSAGE_PATTERNS.CREATE_EVENT)
  async create(@Payload() createEventDto: CreateEventDto): Promise<{ result: string; id: string }> {
    this.logger.debug(`이벤트 생성 요청 수신: ${EVENT_MESSAGE_PATTERNS.CREATE_EVENT}`);
    const result = await this.eventService.create(createEventDto);
    this.logger.log(`이벤트 생성 완료: ID=${result._id.toString()}`);
    return { result: 'success', id: result._id.toString() };
  }

  // 이벤트 상세 조회
  @MessagePattern(EVENT_MESSAGE_PATTERNS.FIND_ONE_EVENT)
  async findOne(@Payload() payload: { id: string }): Promise<{ result: string; data: EventDocument }> {
    this.logger.debug(`이벤트 조회 요청 수신: ${EVENT_MESSAGE_PATTERNS.FIND_ONE_EVENT}, ID=${payload.id}`);
    const result = await this.eventService.findOne(payload.id);
    this.logger.log(`이벤트 조회 완료: ID=${payload.id}`);
    return { result: 'success', data: result as EventDocument };
  }

  // 이벤트 목록 조회 (간단하게만 페이지네이션 적용, 정렬 기능 추가)
  @MessagePattern(EVENT_MESSAGE_PATTERNS.FIND_ALL_EVENTS)
  async findAll(
    @Payload() query: FindEventsQueryDto,
  ): Promise<{ result: string; data: EventDocument[]; total: number; page: number; limit: number }> {
    this.logger.log(`Received message for ${EVENT_MESSAGE_PATTERNS.FIND_ALL_EVENTS}: ${JSON.stringify(query)}`);
    const result = await this.eventService.findAll(query);
    this.logger.log(`이벤트 목록 조회 완료: ${result.data.length}개의 이벤트`);
    return { result: 'success', data: result.data, total: result.total, page: result.page, limit: result.limit };
  }

  // 이벤트 수정 생략하겠습니다.

  // 이벤트 삭제 생략하겠습니다.
}
