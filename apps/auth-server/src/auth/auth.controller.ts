import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Req,
  HttpException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

// import { AuthGuard } from '@nestjs/passport'; // Passport의 기본 AuthGuard
// import { LocalAuthGuard } from './guards/local-auth.guard'; // 만약 LocalAuthGuard를 만들었다면
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';

export interface AuthenticatedRequest extends Request {
  user: {
    email: string;
    role: string;
  };
}

@ApiTags('Auth')
@UseInterceptors(ClassSerializerInterceptor)
@Controller({ path: 'v1/auth', version: '1' })
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * 사용자 회원가입
   * POST /auth/register
   */
  @Post('register')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input or user already exists.' })
  @HttpCode(HttpStatus.CREATED) // 성공 시 201 Created 반환
  async register(@Body() dto: CreateUserDto): Promise<{ result: string; id?: string; message: string }> {
    try {
      await this.authService.register(dto);
      return {
        result: 'success',
        message: '회원가입이 성공적으로 완료되었습니다.',
      };
    } catch (error) {
      this.logger.error(`회원가입 실패: ${error}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          result: 'fail',
          message: `회원가입 처리 중 오류가 발생했습니다`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * 사용자 로그인
   */
  // @Post('login')
  // @ApiOperation({ summary: 'User login' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Login successful, returns access token.',
  //   schema: { example: { accessToken: 'string', refreshToken: 'string' } },
  // })
  // @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials.' })
  @MessagePattern('auth_login')
  async login(@Payload() loginDto: LoginDto): Promise<{ accessToken: string }> {
    try {
      // 1. 사용자 자격 증명 검증 (AuthService.validateUser는 실패 시 UnauthorizedException 발생)
      const user = await this.authService.verifyUser(loginDto);
      // 2. 토큰 발행
      const token = await this.authService.login(user);

      this.logger.log(`User ${user.username} logged in successfully.`);
      return token;
    } catch (error) {
      this.logger.error(`로그인 실패: ${error}`);
      if (error instanceof HttpException) {
        throw new RpcException({
          status: error.getStatus(), // HTTP status 사용
          message: error.message,
          error: error.getResponse(),
        });
      }
      throw new RpcException({
        status: 500,
        message: 'Internal server error',
      });
    }
  }

  /**
   * 사용자 로그아웃
   * POST /auth/logout
   * 요청 헤더의 Bearer 토큰으로 인증된 사용자
   * Body 의 refreshToken 으로 해당 토큰을 블랙리스트 처리
   */
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth() // Swagger에서 JWT 토큰 인증 필요 명시
  @Post('logout')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired token.' })
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: AuthenticatedRequest): Promise<{ result: string; message: string }> {
    try {
      const { email } = req.user;
      this.logger.log(`User ${email} requested logout.`);

      await this.authService.logout(email); // 필요하다면 사용자 정보를 넘겨줄 수 있음

      return { result: 'success', message: '성공적으로 로그아웃되었습니다.' };
    } catch (error) {
      this.logger.error(`로그아웃 실패: ${error}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          result: 'fail',
          message: `로그아웃 실패`,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * 토큰 재발급
   * POST /auth/refresh
   */
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully.',
    schema: { example: { result: 'success', accessToken: 'string', refreshToken: 'string' } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired refresh token.' })
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshDto: RefreshTokenDto): Promise<{ result: string; accessToken: string; refreshToken: string }> {
    try {
      const { refreshtoken } = refreshDto;
      const token = await this.authService.refreshToken(refreshtoken);
      return { result: 'success', accessToken: token.accessToken, refreshToken: token.refreshToken };
    } catch (error) {
      this.logger.error(`토큰 재발급 실패: ${error}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          result: 'fail',
          message: `토큰 재발급 실패`,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
