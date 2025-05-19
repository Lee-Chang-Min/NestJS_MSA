import { InjectModel } from '@nestjs/mongoose';
import { CreateEventDto } from './dto/create-event.dto';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  constructor(@InjectModel(Event.name) private readonly eventModel: Model<EventDocument>) {}

  /**
   * 이벤트 생성
   * @param createEventDto CreateEventDto
   * @returns EventDocument
   */
  async create(createEventDto: CreateEventDto): Promise<EventDocument> {
    this.logger.debug(`이벤트 생성 시작: ${JSON.stringify(createEventDto)}`);
    try {
      const createdEvent = new this.eventModel(createEventDto);
      const savedEvent = await createdEvent.save();
      return savedEvent;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * 이벤트 상세 조회
   * @param id string
   * @returns EventDocument | null
   */
  async findOne(id: string): Promise<EventDocument | null> {
    try {
      const event = await this.eventModel.findById(id);
      if (!event) {
        throw new NotFoundException('이벤트를 찾을 수 없습니다');
      }
      return event;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
