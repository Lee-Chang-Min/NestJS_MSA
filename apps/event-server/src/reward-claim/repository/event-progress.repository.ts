import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserEventProgress, UserEventProgressDocument } from '../schemas/event-progress.schema';

@Injectable()
export class EventProgressRepository {
  constructor(@InjectModel(UserEventProgress.name) private eventProgressModel: Model<UserEventProgressDocument>) {}

  async findByUserIdAndEventId(userId: Types.ObjectId, eventId: Types.ObjectId): Promise<UserEventProgressDocument | null> {
    return this.eventProgressModel.findOne({ userId, eventId }).exec();
  }

  // 추가적인 CRUD 메소드 구현 가능
}
