import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

// 기능 모듈
import { ClientsModule } from './microservices/client.module';
import { AuthProxyModule } from './modules/auth-proxy/auth-proxy.module';
// import { EventProxyModule } from './modules/event-proxy/event-proxy.module';
// import { HealthModule } from './modules/health/health.module';

// 공통 모듈
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/role.guard';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true, // 전역 모듈로 설정
      envFilePath: '.env',
      validationOptions: {
        allowUnknown: true,
        abortEarly: false, // 모든 유효성 검사 오류를 한 번에 보고
      },
    }),
    // 3. Microservice Clients Module
    ClientsModule,
    AuthProxyModule,
    // EventProxyModule,
    // HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
