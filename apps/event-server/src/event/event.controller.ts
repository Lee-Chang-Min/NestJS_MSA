import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
// import { UpdateEventDto } from './dto/update-event.dto';
// import { FindEventsQueryDto } from './dto/find-events-query.dto';
import { EventDocument } from './schemas/event.schema';

export const EVENT_MESSAGE_PATTERNS = {
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

  @MessagePattern(EVENT_MESSAGE_PATTERNS.CREATE_EVENT)
  async create(@Payload() createEventDto: CreateEventDto): Promise<{ id: string }> {
    this.logger.debug(`이벤트 생성 요청 수신: ${EVENT_MESSAGE_PATTERNS.CREATE_EVENT}`);
    const result = await this.eventService.create(createEventDto);
    this.logger.log(`이벤트 생성 완료: ID=${result._id.toString()}`);
    return { id: result._id.toString() };
  }

  @MessagePattern(EVENT_MESSAGE_PATTERNS.FIND_ONE_EVENT)
  async findOne(@Payload() payload: { id: string }): Promise<EventDocument> {
    this.logger.debug(`이벤트 조회 요청 수신: ${EVENT_MESSAGE_PATTERNS.FIND_ONE_EVENT}, ID=${payload.id}`);
    const result = await this.eventService.findOne(payload.id);
    this.logger.log(`이벤트 조회 완료: ID=${payload.id}`);
    return result as EventDocument;
  }

  // @MessagePattern(EVENT_MESSAGE_PATTERNS.FIND_ALL_EVENTS)
  // async findAll(@Payload() query: FindEventsQueryDto): Promise<{ data: EventDocument[]; total: number; page: number; limit: number }> {
  //   this.logger.log(`Received message for ${EVENT_MESSAGE_PATTERNS.FIND_ALL_EVENTS}: ${JSON.stringify(query)}`);
  //   return this.eventService.findAll(query);
  // }

  // @MessagePattern(EVENT_MESSAGE_PATTERNS.UPDATE_EVENT)
  // async update(
  //   // 페이로드에 id와 업데이트할 데이터를 함께 전달받습니다.
  //   @Payload() payload: { id: string; updateEventDto: UpdateEventDto },
  // ): Promise<EventDocument | null> {
  //   this.logger.log(`Received message for ${EVENT_MESSAGE_PATTERNS.UPDATE_EVENT}: ${JSON.stringify(payload)}`);
  //   // 위와 마찬가지로 id 유효성 검사는 서비스 또는 DTO 레벨에서 처리합니다.
  //   // 예: export class UpdateEventPayloadDto { @IsMongoId() id: string; @ValidateNested() @Type(()=>UpdateEventDto) updateEventDto: UpdateEventDto; }
  //   // @Payload() payload: UpdateEventPayloadDto
  //   return this.eventsService.update(payload.id, payload.updateEventDto);
  // }

  // @MessagePattern(EVENT_MESSAGE_PATTERNS.DELETE_EVENT)
  // async remove(
  //   // 페이로드에 id를 포함시켜 전달받습니다.
  //   @Payload() payload: { id: string },
  // ): Promise<{ deleted: boolean; id?: string; message?: string }> { // 반환 타입을 좀 더 명확하게
  //   this.logger.log(`Received message for ${EVENT_MESSAGE_PATTERNS.DELETE_EVENT}: ${JSON.stringify(payload)}`);
  //   // 서비스의 remove가 boolean이나 상세 정보를 반환하도록 수정하는 것이 좋습니다.
  //   // 여기서는 예시로 객체를 반환하도록 가정합니다.
  //   try {
  //     await this.eventsService.remove(payload.id);
  //     return { deleted: true, id: payload.id };
  //   } catch (error) {
  //     // 실제로는 에러 필터를 통해 표준화된 에러 응답을 보내는 것이 좋습니다.
  //     this.logger.error(`Error deleting event ${payload.id}`, error.stack);
  //     return { deleted: false, id: payload.id, message: error.message };
  //   }
  // }
}
