import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

// 보상 유형을 나타내는 Enum (확장 가능)
export enum RewardType {
  POINT = 'POINT', // 포인트
  ITEM = 'ITEM', // 아이템
  COUPON = 'COUPON', // 쿠폰
  // 필요에 따라 다른 유형 추가 가능 (예: CURRENCY, VIRTUAL_GOOD)
}

@Schema({ collection: 'rewards', timestamps: true })
export class Reward {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: Types.ObjectId; // 명시적으로 _id를 선언하여 ObjectId 타입을 사용

  /** 보상명 (예: "출석 7일 보너스", "골드 상자" 등) */
  @Prop({ required: true, trim: true })
  name: string;

  /** 보상 타입 */
  @Prop({
    required: true,
    enum: Object.values(RewardType),
  })
  type: RewardType;

  /** 이벤트 아이디 */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event', required: true })
  eventId: string;

  /**
   * 보상 유형에 따른 상세 정보.
   * 이 필드의 구조는 'type' 필드의 값에 따라 달라집니다.
   * 예:
   * - type: POINT => details: { amount: 1000 }
   * - type: ITEM => details: { itemId: "ITEM_CODE_001", itemName: "파워엘릭서"}
   * - type: COUPON => details: { couponCode: "WELCOME2024", discountValue: 10, discountType: "percentage" }
   */
  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  details: Record<string, any>;

  /** 각 보상 항목별 수량 (예: 아이템 N개, 쿠폰 N장) */
  @Prop({ required: true, default: 1, min: 1 })
  quantity: number;

  /** 재고 */
  @Prop({ required: true, default: null, min: 0 })
  stock?: number | null;

  /** 추가 확장 정보를 자유롭게 담는 JSON 필드 */
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export type RewardDocument = Reward & Document;
export const RewardSchema = SchemaFactory.createForClass(Reward);
