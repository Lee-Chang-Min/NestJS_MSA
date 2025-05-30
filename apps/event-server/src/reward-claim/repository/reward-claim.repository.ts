import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { RewardClaim, RewardClaimDocument } from '../schemas/reward-claim.schema';

@Injectable()
export class RewardClaimRepository {
  constructor(
    @InjectModel(RewardClaim.name)
    private readonly model: Model<RewardClaimDocument>,
  ) {}

  async rewardClaimList(filter: FilterQuery<RewardClaimDocument>): Promise<RewardClaimDocument[]> {
    return this.model.find(filter).exec();
  }

  async findByUserAndReward(userId: Types.ObjectId, eventId: Types.ObjectId, rewardId: Types.ObjectId): Promise<RewardClaimDocument | null> {
    return this.model.findOne({ userId, eventId, rewardId }).exec();
  }

  async create(data: Partial<RewardClaim>): Promise<RewardClaimDocument> {
    return this.model.create(data);
  }

  //   async updateStatus(id: Types.ObjectId, status: RewardClaim['status'], reason?: string): Promise<RewardClaimDocument> {
  //     return this.model.findByIdAndUpdate(id, { status, reason, processedAt: new Date() }, { new: true }).exec();
  //   }
}
