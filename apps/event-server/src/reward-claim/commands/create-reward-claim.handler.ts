import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { CreateRewardClaimCommand } from './create-reward-claim.command';
import { RewardClaimDocument } from '../schemas/reward-claim.schema';
import { RewardClaimRepository } from '../repository/reward-claim.repository';
import { EventProgressRepository } from '../repository/event-progress.repository';
import { EventStatus, ConditionDef, EventApprovalType } from '../../event/schemas/event.schema';
import { EventService } from '../../event/event.service';
// 예시: import { RewardClaimRequestedEvent } from '../../events/impl/reward-claim-requested.event';

@CommandHandler(CreateRewardClaimCommand)
export class CreateRewardClaimHandler implements ICommandHandler<CreateRewardClaimCommand> {
  private readonly logger = new Logger(CreateRewardClaimHandler.name);

  constructor(
    private readonly rewardClaimRepository: RewardClaimRepository,
    private readonly eventProgressRepository: EventProgressRepository,
    private readonly eventService: EventService,
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
        throw error;
      }
      this.logger.error(`error: ${error}`);
      throw new BadRequestException({
        code: 'DUPLICATE_REWARD_CLAIM',
        message: '보상 요청 중복 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      });
    }

    // 2. 이벤트 조건 검증
    // 2-1 현재 진행한 이벤트 진행 중인지 + 보상 받을 수 있는 상태
    const event = await this.eventService.findOne(eventId.toString());
    if (!event || event.status !== EventStatus.ACTIVE) {
      throw new BadRequestException({
        code: 'INVALID_EVENT_STATUS',
        message: '진행 중인 이벤트가 없거나 이벤트 상태가 올바르지 않습니다.',
      });
    }

    // 2-2 이벤트 조건 검증 (자동 승인 이벤트)
    if (event.approvalType === EventApprovalType.AUTO) {
      const eventConditions: ConditionDef[] = event.conditions;
      const eventProgress = await this.eventProgressRepository.findByUserIdAndEventId(userId, eventId);
      if (!eventProgress) {
        // 사용자의 이벤트 진행 정보가 없는 경우, 조건을 만족하지 못한 것으로 간주
        throw new BadRequestException({
          code: 'INVALID_EVENT_CONDITION',
          message: '이벤트 참여 기록이 없거나 조건을 만족하지 못했습니다.',
        });
      }

      for (const condition of eventConditions) {
        const eventType = condition.type;
        const [paramKey, paramValue] = Object.entries(condition.params)[0] as [string, number]; // 첫 번째 키-값 쌍 추출

        // eventProgress 객체 내에 실제 조건을 만족하는 데이터를 저장하는 필드명으로 변경해야 합니다.
        // 예: eventProgress.progress[conditionType.toLowerCase()]
        const progressType = eventType.toLowerCase();
        const userProgress = eventProgress.progress?.[progressType] as Record<string, number>;
        const userProgressValue = userProgress ? (userProgress[paramKey] ?? 0) : 0;

        if (userProgressValue < paramValue) {
          throw new BadRequestException({
            code: 'INVALID_EVENT_CONDITION',
            message: `${eventType} 조건을 만족하지 못했습니다. 필요: ${paramValue}, 현재: ${userProgressValue}`,
          });
        }
      }
    }

    // 3. 요청 정보 저장
    let savedClaim: RewardClaimDocument;
    try {
      savedClaim = await this.rewardClaimRepository.create({ userId, eventId, rewardId });
      this.logger.log(`RewardClaim (ID: ${savedClaim._id.toString()}) created successfully `);
    } catch (error) {
      this.logger.error(`Failed to save RewardClaim for ${error}`);
      throw new BadRequestException({
        code: 'FAILED_TO_SAVE_REWARD_CLAIM',
        message: '보상 요청을 저장하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      });
    }

    // 추가적인 비즈니스 로직이 고려되었을때. 현재 과제에서는 일단 배제
    // 4. 이벤트 발행: 보상 요청이 성공적으로 생성되었음을 알림
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
