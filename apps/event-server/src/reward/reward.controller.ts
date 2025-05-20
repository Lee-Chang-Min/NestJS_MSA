import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RewardService } from './reward.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { RewardDocument } from './schemas/reward.schema';

export const REWARD_MESSAGE_PATTERNS = {
  CREATE_REWARD: 'reward.create',
  FIND_ONE_REWARD: 'reward.findOne',
  UPDATE_REWARD: 'reward.update',
  DELETE_REWARD: 'reward.delete',
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
  async findOne(@Payload() payload: { id: string }): Promise<{ result: string; data: RewardDocument }> {
    this.logger.debug(`보상 조회 요청 수신: ${REWARD_MESSAGE_PATTERNS.FIND_ONE_REWARD}, ID=${payload.id}`);
    const result = await this.rewardService.findOne(payload.id);
    this.logger.log(`보상 조회 완료: ID=${payload.id}`);
    return { result: 'success', data: result as RewardDocument };
  }

  /**
   * 특정 보상의 정보를 업데이트합니다.
   * 주로 보상의 이름, 설명, 타입, 상세 정보, 지급량(quantity), 재고(stock) 등을 수정할 때 사용됩니다.
   */
  @MessagePattern(REWARD_MESSAGE_PATTERNS.UPDATE_REWARD)
  async update(@Payload() payload: UpdateRewardDto): Promise<RewardDocument> {
    this.logger.debug(`보상 업데이트 요청 수신: ${REWARD_MESSAGE_PATTERNS.UPDATE_REWARD}`);
    const result = await this.rewardService.update(payload.id, payload.updateRewardDto);
    this.logger.debug(`Update Data: ${JSON.stringify(payload)}`);
    return result;
  }

  @MessagePattern(REWARD_MESSAGE_PATTERNS.DELETE_REWARD)
  async remove(@Payload() payload: { id: string }): Promise<{ result: string; id?: string }> {
    this.logger.log(`보상 삭제 요청 수신: ${REWARD_MESSAGE_PATTERNS.DELETE_REWARD}, ID=${payload.id}`);
    await this.rewardService.remove(payload.id);
    return { result: 'success', id: payload.id };
  }
}
