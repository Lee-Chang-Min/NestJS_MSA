// gateway-server/src/modules/auth-proxy/auth-proxy.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  UseInterceptors,
  ClassSerializerInterceptor,
  // UseGuards,
  // Req,
  // Get,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AUTH_SERVICE_TOKEN } from '../../microservices/client-proxy.provider';
import { Public } from '../../common/decorators/public.decorator';
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../../common/guards/roles.guard';

// import { CreateUserDto } from '@dto/auth/create-user.dto';
// import { LoginDto } from '@dto/auth/login.dto';
// import { RefreshTokenDto } from '@dto/auth/refresh-token.dto';
import { CreateUserDto } from '../../../../libs/shared/dto/auth/create-user.dto';
import { LoginDto } from '../../../../libs/shared/dto/auth/login.dto';

export interface GatewayAuthenticatedRequest extends Request {
  user: {
    email: string;
    role: string;
  };
}

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
  @ApiOperation({ summary: '새로운 사용자 생성 (회원가입)' })
  @ApiResponse({ status: 201, description: '회원가입 성공.' })
  @ApiResponse({ status: 400, description: '잘못된 요청 또는 이미 사용자가 존재함.' })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto): Promise<any> {
    try {
      this.logger.log(`[Gateway] Forwarding 'POST /v1/auth/register' to AUTH_SERVICE`);
      return firstValueFrom(this.authClient.send('auth_register', createUserDto));
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
  @ApiOperation({ summary: '사용자 로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공, 토큰 반환.' })
  @ApiResponse({ status: 401, description: '인증 실패.' })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<any /* { accessToken: string, refreshToken: string } */> {
    try {
      this.logger.log(`[Gateway] Forwarding 'POST /v1/auth/login' to AUTH_SERVICE`);
      return firstValueFrom(this.authClient.send('auth_login', loginDto));
    } catch (error) {
      this.logger.error(`[Gateway] Error logging in: ${error}`);
      throw error;
    }
  }

  // /**
  //  * 사용자 로그아웃
  //  */
  // @UseGuards(JwtAuthGuard) // Gateway의 JwtAuthGuard로 보호
  // @ApiBearerAuth() // Swagger에서 JWT 인증 필요 명시
  // @Post('logout')
  // @ApiOperation({ summary: '사용자 로그아웃' })
  // @ApiResponse({ status: 200, description: '로그아웃 성공.' })
  // @ApiResponse({ status: 401, description: '인증되지 않음.' })
  // @HttpCode(HttpStatus.OK)
  // async logout(@Req() req: GatewayAuthenticatedRequest): Promise<any> {
  //   const { userId, username } = req.user;
  //   this.logger.log(`[Gateway] Forwarding 'POST /v1/auth/logout' for user ${username} (ID: ${userId}) to AUTH_SERVICE`);
  //   // AuthServer의 'auth_logout' 패턴은 userId를 payload로 받을 것으로 예상
  //   return firstValueFrom(
  //     sendWithTimeoutAndRetry(this.authClient, 'auth_logout', { userId }),
  //   );
  // }

  // /**
  //  * 토큰 재발급
  //  */
  // @Public() // Refresh Token 자체가 인증 수단이므로, Access Token 기반 Guard는 불필요
  //           // (필요하다면 RefreshTokenGuard를 별도로 만들어 적용)
  // @Post('refresh')
  // @ApiOperation({ summary: 'Access Token 재발급' })
  // @ApiResponse({ status: 200, description: '토큰 재발급 성공.', /* schema: { example: ... } */ })
  // @ApiResponse({ status: 401, description: '유효하지 않은 Refresh Token.' })
  // @HttpCode(HttpStatus.OK)
  // async refresh(@Body() refreshTokenDto: any /* RefreshTokenDto */): Promise<any /* Tokens */> {
  //   this.logger.log(`[Gateway] Forwarding 'POST /v1/auth/refresh' to AUTH_SERVICE`);
  //   // refreshDto는 { refreshToken: '...' } 형태일 것으로 예상
  //   return firstValueFrom(
  //     sendWithTimeoutAndRetry(this.authClient, 'auth_refresh_tokens', refreshTokenDto),
  //   );
  // }

  // /**
  //  * (선택 사항) 현재 로그인된 사용자 정보 확인 (토큰 테스트용)
  //  */
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // @Get('profile') // 또는 'me'
  // @ApiOperation({ summary: '현재 인증된 사용자 프로필 조회' })
  // @ApiResponse({ status: 200, description: '사용자 프로필 정보.' })
  // @ApiResponse({ status: 401, description: '인증되지 않음.' })
  // async getProfile(@Req() req: GatewayAuthenticatedRequest): Promise<any> {
  //   const { userId, username } = req.user;
  //   this.logger.log(`[Gateway] Forwarding 'GET /v1/auth/profile' for user ${username} (ID: ${userId}) to AUTH_SERVICE`);
  //   return firstValueFrom(
  //     sendWithTimeoutAndRetry(this.authClient, 'auth_get_profile', { userId }),
  //   );
  // }
}
