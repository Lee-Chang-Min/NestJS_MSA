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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserDocument } from '../users/schemas/users.schema';
import { LoginDto } from './dto/login.dto';

// import { AuthGuard } from '@nestjs/passport'; // Passport의 기본 AuthGuard
// import { LocalAuthGuard } from './guards/local-auth.guard'; // 만약 LocalAuthGuard를 만들었다면
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    username: string;
    roles: string[];
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
  @HttpCode(HttpStatus.CREATED) // 성공 시 201 Created 반환
  async register(
    @Body() dto: CreateUserDto,
  ): Promise<{ result: string; id: string; message: string }> {
    const registeredUser: UserDocument = await this.authService.register(dto);
    // this.logger.log(`User ${dto.username} registered successfully with ID: ${registeredUser._id}`);
    return {
      result: 'success',
      id: registeredUser._id.toString(),
      message: '회원가입이 성공적으로 완료되었습니다.',
    };
  }

  /**
   * 사용자 로그인
   */
  @Post('login')
  @HttpCode(HttpStatus.OK) // 성공 시 200 OK 반환
  async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string }> {
    // 1. 사용자 자격 증명 검증 (AuthService.validateUser는 실패 시 UnauthorizedException 발생)
    const user = await this.authService.verifyUser(loginDto);
    // 2. 토큰 발행
    const token = await this.authService.login(user);

    this.logger.log(`User ${user.username} logged in successfully.`);
    return token;
  }

  /**
   * 사용자 로그아웃
   * POST /auth/logout
   * 요청 헤더의 Bearer 토큰으로 인증된 사용자
   * Body 의 refreshToken 으로 해당 토큰을 블랙리스트 처리
   */
  @UseGuards(AuthGuard('jwt')) // 'jwt'는 JwtStrategy를 사용하도록 PassportModule에 설정된 기본값 또는 이름
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: AuthenticatedRequest,
    @Body() refreshToken: { refreshToken: string },
  ): Promise<{ message: string }> {
    // req.user에는 JwtStrategy의 validate 메소드에서 반환한 페이로드 정보가 들어있습니다.
    const { userId, username } = req.user;
    this.logger.log(`User ${username} (ID: ${userId}) requested logout.`);

    await this.authService.logout(/* req.user */); // 필요하다면 사용자 정보를 넘겨줄 수 있음

    return { message: '성공적으로 로그아웃되었습니다.' };
  }

  /**
   * (선택 사항) 현재 로그인된 사용자 정보 확인 (토큰 테스트용)
   * GET /auth/profile 또는 /auth/me
   * JWT 기반 인증 필요
   */
  // @UseGuards(AuthGuard('jwt'))
  // @Get('profile') // 또는 'me'
  // getProfile(@Req() req: AuthenticatedRequest): AuthenticatedRequest['user'] {
  //   this.logger.log(`Workspaceing profile for user: ${req.user.username} (ID: ${req.user.userId})`);
  //   // req.user는 JwtStrategy의 validate 메소드에서 반환된 값입니다.
  //   // (예: { userId: '...', username: '...', roles: ['...'] })
  //   return req.user;
  // }
}
