// gateway-server/src/modules/auth-proxy/auth-proxy.controller.ts
import {
  Controller,
  Post,
  Body,
  Logger,
  UseInterceptors,
  ClassSerializerInterceptor,
  Req,
  // UseGuards,
  // Get,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ApiTags } from '@nestjs/swagger';

import { AUTH_SERVICE_TOKEN } from '../../microservices/client-proxy.provider';
import { Public } from '../../common/decorators/public.decorator';
import { CreateUserDto } from '../../../../libs/shared/dto/auth/create-user.dto';
import { LoginDto } from '../../../../libs/shared/dto/auth/login.dto';
import { RefreshTokenDto } from 'apps/auth-server/src/auth/dto/refresh-token.dto';

export interface AuthenticatedRequest extends Request {
  user: {
    userID: string;
    role: string;
  };
}

export interface MicroserviceError {
  result: string;
  status: number;
  message: string;
}

const AUTH_MESSAGE_PATTERNS = {
  REGISTER: 'auth.register',
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',
  REFRESH: 'auth.refresh',
};

@ApiTags('Auth v1')
@UseInterceptors(ClassSerializerInterceptor)
@Controller({ path: 'v1/auth', version: '1' })
export class AuthProxyController {
  private readonly logger = new Logger(AuthProxyController.name);

  constructor(@Inject(AUTH_SERVICE_TOKEN) private readonly authClient: ClientProxy) {}

  /**
   * 사용자 회원가입
   */
  @Public() // 인증 없이 접근 가능
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<any> {
    try {
      this.logger.log(`[Gateway] Forwarding 'POST /v1/auth/register' to AUTH_SERVICE`);
      return firstValueFrom(this.authClient.send(AUTH_MESSAGE_PATTERNS.REGISTER, createUserDto));
    } catch (error) {
      this.logger.error(`[Gateway] Error registering user: ${error}`);
      throw error;
    }
  }

  /**
   * 사용자 로그인
   */
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<any /* { accessToken: string, refreshToken: string } */> {
    try {
      this.logger.log(`[Gateway] Forwarding 'POST /v1/auth/login' to AUTH_SERVICE`);
      return firstValueFrom(this.authClient.send(AUTH_MESSAGE_PATTERNS.LOGIN, loginDto));
    } catch (error) {
      this.logger.error(`[Gateway] Error logging in: ${error}`);
      throw error;
    }
  }

  /**
   * 사용자 로그아웃 => 로그인 검증 후 로그아웃 처리
   */
  @Post('logout')
  async logout(@Req() req: AuthenticatedRequest): Promise<any> {
    try {
      const userID = req.user.userID;
      this.logger.log(`[Gateway] Forwarding 'POST /v1/auth/logout' for user ${userID} to AUTH_SERVICE`);
      return firstValueFrom(this.authClient.send(AUTH_MESSAGE_PATTERNS.LOGOUT, { userID }));
    } catch (error) {
      this.logger.error(`[Gateway] Error logging out: ${error}`);
      throw error;
    }
  }

  /**
   * 토큰 재발급 => 로그인 사용자 토큰 재발급
   */
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ result: string; accessToken: string; refreshToken: string }> {
    try {
      this.logger.log(`[Gateway] Forwarding 'POST /v1/auth/refresh' to AUTH_SERVICE`);
      return firstValueFrom(this.authClient.send(AUTH_MESSAGE_PATTERNS.REFRESH, refreshTokenDto));
    } catch (error) {
      this.logger.error(`[Gateway] Error refreshing tokens: ${error}`);
      throw error;
    }
  }
}
