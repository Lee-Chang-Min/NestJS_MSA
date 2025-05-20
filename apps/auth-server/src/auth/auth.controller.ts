import { Controller, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

const AUTH_MESSAGE_PATTERNS = {
  REGISTER: 'auth.register',
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',
  REFRESH: 'auth.refresh',
};

export interface AuthenticatedRequest extends Request {
  user: {
    userID: string;
    role: string;
  };
}

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * 사용자 회원가입
   */
  @MessagePattern(AUTH_MESSAGE_PATTERNS.REGISTER)
  async register(@Payload() dto: CreateUserDto): Promise<{ result: string; id?: string; message: string }> {
    this.logger.debug(`회원가입 요청 수신: ${AUTH_MESSAGE_PATTERNS.REGISTER}`);
    const result = await this.authService.register(dto);
    this.logger.log(`회원가입 완료: ${result.email}`);
    return {
      result: 'success',
      message: '회원가입이 성공적으로 완료되었습니다.',
    };
  }

  /**
   * 사용자 로그인
   */
  @MessagePattern(AUTH_MESSAGE_PATTERNS.LOGIN)
  async login(@Payload() loginDto: LoginDto): Promise<{ result: string; accessToken: string; refreshToken: string }> {
    this.logger.debug(`로그인 요청 수신: ${AUTH_MESSAGE_PATTERNS.LOGIN}`);
    // 1. 사용자 자격 증명 검증 (AuthService.validateUser는 실패 시 UnauthorizedException 발생)
    const user = await this.authService.verifyUser(loginDto);
    // 2. 토큰 발행
    const token = await this.authService.login(user);

    this.logger.log(`User ${user.username} logged in successfully.`);
    return { result: 'success', accessToken: token.accessToken, refreshToken: token.refreshToken };
  }

  /**
   * 사용자 로그아웃
   * 요청 헤더의 Bearer 토큰으로 인증된 사용자
   * Body 의 refreshToken 으로 해당 토큰을 블랙리스트 처리
   */
  @MessagePattern(AUTH_MESSAGE_PATTERNS.LOGOUT)
  async logout(@Payload() body: { userID: string }): Promise<{ result: string; message: string }> {
    this.logger.debug(`로그아웃 요청 수신: ${AUTH_MESSAGE_PATTERNS.LOGOUT}`);
    const userID = body.userID;
    await this.authService.logout(userID);
    this.logger.log(`User ${userID} requested logout.`);

    return { result: 'success', message: '성공적으로 로그아웃되었습니다.' };
  }

  /**
   * 토큰 재발급
   * POST /auth/refresh
   */
  @MessagePattern(AUTH_MESSAGE_PATTERNS.REFRESH)
  async refresh(@Payload() refreshDto: RefreshTokenDto): Promise<{ result: string; accessToken: string; refreshToken: string }> {
    this.logger.debug(`토큰 재발급 요청 수신: ${AUTH_MESSAGE_PATTERNS.REFRESH}`);
    const { refreshToken } = refreshDto;
    const token = await this.authService.refreshToken(refreshToken);
    return { result: 'success', accessToken: token.accessToken, refreshToken: token.refreshToken };
  }
}
