import { Types } from 'mongoose';

export class CreateRewardClaimCommand {
  constructor(
    public readonly userId: Types.ObjectId,
    public readonly eventId: Types.ObjectId,
    public readonly rewardId: Types.ObjectId,
    public readonly claimedQuantity: number = 1, // 핸들러에서 DTO의 undefined를 처리하거나, 기본값을 설정
  ) {}
}
