import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reward, RewardSchema } from './schemas/reward.schema';
import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Reward.name, schema: RewardSchema }])],
  controllers: [RewardController],
  providers: [RewardService],
  exports: [RewardService],
})
export class RewardModule {}
