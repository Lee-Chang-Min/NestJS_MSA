import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

// RewardClaim 상태를 위한 Enum
export enum RewardClaimStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL', // 승인 대기 중 - 관리자 검토 필요
  AUTO_APPROVED = 'AUTO_APPROVED', // 자동 승인됨 - 시스템에 의해 자동 승인
  REJECTED = 'REJECTED', // 거부됨 - 보상 청구가 거부됨
  SUCCESS = 'SUCCESS', // 지급 완료 - 보상이 완전히 지급됨
  ERROR = 'ERROR', // 오류 - 처리 중 오류 발생
}

@Schema({
  timestamps: true,
  collection: 'reward_claims',
})
export class RewardClaim {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: Types.ObjectId; // 명시적으로 _id를 선언하여 ObjectId 타입을 사용

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event', required: true, index: true })
  eventId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Reward', required: true, index: true })
  rewardId: Types.ObjectId;

  @Prop({ type: Number, default: 1, min: 1 })
  claimedQuantity: number; // 수령한 보상 개수

  @Prop({
    type: String,
    enum: RewardClaimStatus, // 직접 enum 객체를 사용
    default: RewardClaimStatus.PENDING_APPROVAL,
    required: true,
    index: true,
  })
  status: RewardClaimStatus;

  @Prop({ type: String, trim: true, required: false })
  resolutionNotes?: string; // 처리 결과 노트 (예: 거절 사유)

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  processedBy?: Types.ObjectId; // 처리한 관리자/운영자

  @Prop({ type: Date, required: false })
  processedAt?: Date;
}

export type RewardClaimDocument = RewardClaim & Document;
export const RewardClaimSchema = SchemaFactory.createForClass(RewardClaim);

RewardClaimSchema.index({ userId: 1, eventId: 1, rewardId: 1 }, { unique: true });
