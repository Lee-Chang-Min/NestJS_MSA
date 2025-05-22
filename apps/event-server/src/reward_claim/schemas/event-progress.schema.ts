import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'user_event_progresses',
})
export class UserEventProgress {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event', required: true, index: true })
  eventId: Types.ObjectId;

  /** Event.conditions 배열 내 인덱스를 기준으로 매핑 */
  @Prop({ type: Number, required: true })
  eventConditionIndex: number;

  /** 조건 진행 상태 (동적 구조이므로 Mixed 타입 사용) */
  @Prop({ type: MongooseSchema.Types.Mixed, required: true, default: {} })
  progress: Record<string, any>;

  /** 해당 조건 완료 여부 */
  @Prop({ type: Boolean, default: false, required: true })
  isCompleted: boolean;
}

export type UserEventProgressDocument = UserEventProgress & Document;
export const UserEventProgressSchema = SchemaFactory.createForClass(UserEventProgress);

/** 복합 인덱스 설정: userId + eventId + eventConditionIndex */
UserEventProgressSchema.index({ userId: 1, eventId: 1, eventConditionIndex: 1 }, { unique: true });
