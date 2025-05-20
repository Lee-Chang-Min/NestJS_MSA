import { InjectModel } from '@nestjs/mongoose';
import { CreateEventDto } from './dto/create-event.dto';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { FindEventsQueryDto } from './dto/find-events-query.dto';

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
    this.logger.debug(`create event: ${JSON.stringify(createEventDto)}`);
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
        throw new NotFoundException('event not found');
      }
      return event;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * 이벤트 목록 조회
   * @param query FindEventsQueryDto
   * @returns { data: EventDocument[], total: number, page: number, limit: number }
   */
  async findAll(query: FindEventsQueryDto): Promise<{ data: EventDocument[]; total: number; page: number; limit: number }> {
    const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const filter: Record<string, any> = {};
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'DESC' ? -1 : 1,
    };

    const [data, total] = await Promise.all([
      this.eventModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.eventModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
