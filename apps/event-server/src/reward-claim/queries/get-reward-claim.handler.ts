import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetRewardClaimQuery } from './get-reward-claim.query';
import { RewardClaimDocument } from '../schemas/reward-claim.schema';
import { Logger } from '@nestjs/common';
import { RewardClaimRepository } from '../repository/reward-claim.repository';

@QueryHandler(GetRewardClaimQuery)
export class GetRewardClaimHandler implements IQueryHandler<GetRewardClaimQuery> {
  private readonly logger = new Logger(GetRewardClaimHandler.name);

  constructor(private readonly rewardClaimRepository: RewardClaimRepository) {}

  async execute(query: GetRewardClaimQuery): Promise<RewardClaimDocument[]> {
    this.logger.debug(`보상 요청 조회 실행: userId=${query.userId}`);

    const filter = { userId: query.userId };
    const rewardClaims = await this.rewardClaimRepository.rewardClaimList(filter);

    this.logger.log(`보상 요청 ${rewardClaims.length}개 조회 완료`);
    return rewardClaims;
  }
}
