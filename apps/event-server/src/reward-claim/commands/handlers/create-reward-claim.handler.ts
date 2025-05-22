import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateRewardClaimCommand } from '../impl/create-reward-claim.command';
import { RewardClaimDocument } from '../../schemas/reward-claim.schema';
import { RewardClaimRepository } from '../../repository/reward-claim.repository';
// 예시: import { RewardClaimRequestedEvent } from '../../events/impl/reward-claim-requested.event';

@CommandHandler(CreateRewardClaimCommand)
export class CreateRewardClaimHandler implements ICommandHandler<CreateRewardClaimCommand> {
  private readonly logger = new Logger(CreateRewardClaimHandler.name);

  constructor(
    private readonly rewardClaimRepository: RewardClaimRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateRewardClaimCommand): Promise<RewardClaimDocument> {
    this.logger.debug(`Handling CreateRewardClaimCommand: ${JSON.stringify(command)}`);

    const { userId, eventId, rewardId } = command;

    try {
      // 1. 중복 요청 방지 로직
      // 사용자가 동일 이벤트에 대해 동일 보상을 이미 요청했는지 확인합니다.
      const existingClaim = await this.rewardClaimRepository.findByUserAndReward(userId, eventId, rewardId);

      if (existingClaim) {
        this.logger.warn(`
          Duplicate reward claim attempt for userId: ${userId.toString()}, Existing claim ID: ${existingClaim._id.toString()}, Status: ${existingClaim.status}
          `);
        throw new ConflictException('이미 해당 보상을 요청하셨거나 처리 중입니다. 이전 요청 상태를 확인해주세요.');
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; // ConflictException은 그대로 전달
      }
      this.logger.error(`error: ${error}`);
      throw new InternalServerErrorException('보상 요청 중복 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }

    //2. 이벤트 조건 검증

    // 2. RewardClaim 문서 생성
    // RewardClaim 스키마에 status 기본값이 PENDING_APPROVAL로 설정되어 있습니다.
    // requestMessage는 커맨드에서 전달된 값을 사용합니다.
    // const newRewardClaim = new this.rewardClaimModel({
    //   userId,
    //   eventId,
    //   rewardId,
    //   claimedQuantity, // CreateRewardClaimCommand에서 기본값(1)으로 설정됨
    // });

    // 3. 데이터베이스 저장
    let savedClaim: RewardClaimDocument;
    try {
      savedClaim = await this.rewardClaimRepository.create({ userId, eventId, rewardId });
      this.logger.log(`RewardClaim (ID: ${savedClaim._id.toString()}) created successfully `);
    } catch (error) {
      this.logger.error(`Failed to save RewardClaim for ${error}`);
      throw new InternalServerErrorException('보상 요청을 저장하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }

    // 4. (선택적) 이벤트 발행: 보상 요청이 성공적으로 생성되었음을 알림
    // if (savedClaim) {
    //   this.eventBus.publish(
    //     new RewardClaimRequestedEvent( // RewardClaimRequestedEvent 클래스 정의 필요
    //       savedClaim._id.toHexString(),
    //       savedClaim.userId.toHexString(),
    //       savedClaim.eventId.toHexString(),
    //       savedClaim.rewardId.toHexString(),
    //       savedClaim.status,
    //     ),
    //   );
    //   this.logger.log(`Published RewardClaimRequestedEvent for RewardClaim ID: ${savedClaim._id}`);
    // }

    return savedClaim; // 생성된 RewardClaim 문서를 반환
  }
}
