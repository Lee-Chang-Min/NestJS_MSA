import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRewardDto } from './dto/create-reward.dto';
import { Reward, RewardDocument } from './schemas/reward.schema';
import { Event, EventDocument } from '../event/schemas/event.schema';
@Injectable()
export class RewardService {
  private readonly logger = new Logger(RewardService.name);

  constructor(
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  /**
   * 보상 생성
   * @param createRewardDto CreateRewardDto
   * @returns RewardDocument
   */
  async create(createRewardDto: CreateRewardDto): Promise<RewardDocument> {
    try {
      this.logger.debug(`create reward: ${JSON.stringify(createRewardDto)}`);

      // 실제 존재하는 Event 인지 확인 필요
      const event = await this.eventModel.findById(createRewardDto.eventId);
      if (!event) {
        throw new NotFoundException('event not found');
      }

      const createdReward = new this.rewardModel(createRewardDto);
      const savedReward = await createdReward.save();
      return savedReward;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * 보상 상세 조회
   * @param id string
   * @returns RewardDocument | null
   */
  async findOne(id: string): Promise<RewardDocument | null> {
    try {
      const reward = await this.rewardModel.findById(id);
      if (!reward) {
        throw new NotFoundException('reward not found');
      }
      return reward;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
