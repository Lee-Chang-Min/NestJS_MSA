import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

// 이벤트 상태를 위한 Enum

export interface ConditionDef {
  /** 예: 'LOGIN_DAYS', 'INVITE_FRIEND', 'PURCHASE_AMOUNT' … */
  type: string;
  /** 조건별 파라미터를 자유롭게 확장 */
  params: Record<string, any>;
}
export enum EventStatus {
  ACTIVE = 'active',
  UPCOMING = 'upcoming',
  EXPIRED = 'expired',
}

@Schema({ timestamps: true, collection: 'events' }) // timestamps: createdAt, updatedAt 자동 생성, collection: MongoDB 컬렉션 이름 명시
export class Event {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: Types.ObjectId; // 명시적으로 _id를 선언하여 ObjectId 타입을 사용

  /** 이벤트명 */
  @Prop({ required: true, trim: true })
  name: string;

  /** 이벤트 설명 */
  @Prop({ trim: true })
  description: string;

  /** 이벤트 참여 조건 */
  @Prop({ type: [{ type: Object }], default: [] })
  conditions: ConditionDef[];

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(EventStatus), // 정의된 Enum 값만 허용
    default: EventStatus.UPCOMING,
  })
  status: EventStatus;

  /**
   * 이벤트를 생성한 운영자/관리자의 User ID (Auth Server의 User ID 참조)
   * Auth Server와 직접적인 DB 레퍼런스를 사용하기보다는 ID만 저장하는 것이 일반적입니다.
   */
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, index: true })
  createdBy: Types.ObjectId; // 또는 string 타입으로 User ID를 저장
}

export type EventDocument = Event & Document;
export const EventSchema = SchemaFactory.createForClass(Event);

// 필요한 경우 인덱스 추가
EventSchema.index({ status: 1, endDate: 1 });
EventSchema.index({ startDate: 1 });
