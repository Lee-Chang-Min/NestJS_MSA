import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { RewardClaim, RewardClaimSchema } from './schemas/reward-claim.schema';
import { UserEventProgress, UserEventProgressSchema } from './schemas/event-progress.schema';
import { RewardClaimController } from './controllers/reward-claim.controller';

// import { RequestRewardHandler } from './commands/handlers/request-reward.handler';
// import { GetRewardHistoryHandler } from './queries/handlers/get-reward-history.handler';
// const CommandHandlers = [RequestRewardHandler];
// const QueryHandlers = [GetRewardHistoryHandler];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: RewardClaim.name, schema: RewardClaimSchema },
      { name: UserEventProgress.name, schema: UserEventProgressSchema },
    ]),
  ],
  controllers: [RewardClaimController],
  //   providers: [RewardClaimService, ...CommandHandlers, ...QueryHandlers],
})
export class RewardClaimModule {}
