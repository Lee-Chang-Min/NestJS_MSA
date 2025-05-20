import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RewardService } from './reward.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { RewardDocument } from './schemas/reward.schema';

export const REWARD_MESSAGE_PATTERNS = {
  CREATE_REWARD: 'reward.create',
  FIND_ONE_REWARD: 'reward.findOne',
  // UPDATE_REWARD: 'reward.update',
  // DELETE_REWARD: 'reward.delete',
};

@Controller()
export class RewardController {
  private readonly logger = new Logger(RewardController.name);

  constructor(private readonly rewardService: RewardService) {}

  @MessagePattern(REWARD_MESSAGE_PATTERNS.CREATE_REWARD)
  async create(@Payload() createRewardDto: CreateRewardDto): Promise<{ result: string; id: string }> {
    this.logger.debug(`보상 생성 요청 수신: ${REWARD_MESSAGE_PATTERNS.CREATE_REWARD}`);
    const result = await this.rewardService.create(createRewardDto);
    this.logger.log(`보상 생성 완료: ID=${result._id.toString()}`);
    return { result: 'success', id: result._id.toString() };
  }

  @MessagePattern(REWARD_MESSAGE_PATTERNS.FIND_ONE_REWARD)
  async findOne(@Payload() id: string): Promise<{ result: string; data: RewardDocument }> {
    this.logger.debug(`보상 조회 요청 수신: ${REWARD_MESSAGE_PATTERNS.FIND_ONE_REWARD}, ID=${id}`);
    const result = await this.rewardService.findOne(id);
    this.logger.log(`보상 조회 완료: ID=${id}`);
    return { result: 'success', data: result as RewardDocument };
  }

  // 보상 정보 내용 업데이트 생략하겠습니다.

  // 보상 정보 삭제 생략 하겠습니다.
}
