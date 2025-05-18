import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from '../users/schemas/users.schema';
import { UsersModule } from '../users/users.module';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';
// import { RefreshTokenSchema } from './schemas/refresh-token.schema';

// import { LocalStrategy } from './local.strategy';
// import { JwtStrategy } from './jwt.strategy';
// import { JwtAuthGuard } from './jwt-auth.guard';
// import { RefreshToken, RefreshTokenSchema } from '../refresh-tokens/refresh-token.schema';
// import { RefreshTokensModule } from '../refresh-tokens/refresh-tokens.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME'),
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    ConfigModule,
    UsersModule,
  ],
  providers: [AuthService],
  // providers: [AuthService, LocalStrategy, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
