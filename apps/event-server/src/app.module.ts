import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from './database/mongoose-config.service';

import { EventModule } from './event/event.module';
import { RewardModule } from './reward/reward.module';
// <database-block>
const infrastructureDatabaseModule = MongooseModule.forRootAsync({
  useClass: MongooseConfigService,
});
// </database-block>

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    infrastructureDatabaseModule,
    EventModule,
    RewardModule,
  ],
})
export class AppModule {}
