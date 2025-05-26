import { Controller, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateRewardClaimDto } from '../dto/create-reward-claim.dto';
import { CreateRewardClaimCommand } from '../commands/impl/create-reward-claim.command';
import { RewardClaimDocument } from '../schemas/reward-claim.schema';

const REWARD_CLAIM_MESSAGE_PATTERNS = {
  CREATE_REWARD_CLAIM: 'reward-claim.create',
};

@Controller()
export class RewardClaimController {
  private readonly logger = new Logger(RewardClaimController.name);
  constructor(private readonly commandBus: CommandBus) {}

  // 보상 요청 생성
  @MessagePattern(REWARD_CLAIM_MESSAGE_PATTERNS.CREATE_REWARD_CLAIM)
  async CreateRewardClaim(@Payload() createRewardClaimDto: CreateRewardClaimDto): Promise<{ result: string; id: string }> {
    this.logger.debug(`보상 요청 수신: ${REWARD_CLAIM_MESSAGE_PATTERNS.CREATE_REWARD_CLAIM}`);

    const command = new CreateRewardClaimCommand(createRewardClaimDto.userId, createRewardClaimDto.eventId, createRewardClaimDto.rewardId);
    const result = await this.commandBus.execute<CreateRewardClaimCommand, RewardClaimDocument>(command);

    this.logger.log(`Reward claim (ID: ${result._id.toString()}) created successfully via message pattern.`);
    return { result: 'success', id: result._id.toString() };
  }
}
