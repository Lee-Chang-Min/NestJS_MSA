import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserDocument } from '../users/schemas/users.schema';
import { UsersService } from '../users/users.service';
import { RefreshToken, RefreshTokenDocument } from './schemas/refresh-token.schema';

export interface TokenPayload {
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshTokenDocument>,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  /**
   * 사용자 회원가입 처리
   */
  async register(createUserDto: CreateUserDto): Promise<UserDocument> {
    return this.usersService.create(createUserDto);
  }

  /**
   * 사용자 검증
   * @return 검증된 User 객체
   * @param loginDto LoginDto
   */
  async verifyUser(loginDto: LoginDto): Promise<UserDocument> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    // 비밀번호 검증
    const isPasswordValid = await user.comparePassword(loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('username or password is wrong');
    }

    return user;
  }

  /**
   * 사용자 로그인 처리
   */
  async login(user: UserDocument): Promise<{ accessToken: string; refreshToken: string }> {
    // 토큰 생성
    const tokens = await this.generateTokens(user);
    // refreshToken 저장
    await this.saveRefreshToken(tokens.refreshToken, user._id.toString());

    return tokens;
  }

  /**
   * 로그아웃 처리
   */
  async logout(email: string): Promise<void> {
    // 토큰 블랙리스트 처리
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      this.logger.warn(`로그아웃 시도: 존재하지 않는 이메일 ${email}`);
      return;
    }
    await this.refreshTokenModel.updateOne({ userId: user._id.toString() }, { $set: { isRevoked: true } });
  }

  /**
   * refreshToken 재발급
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // 1) 기존 refreshToken 유효성 검증
    const payload = this.jwtService.verify<TokenPayload>(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });

    const user = await this.usersService.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('username or password is wrong');
    }

    // 2) DB에 저장된 토큰과 일치하는지 확인
    const stored = await this.refreshTokenModel.findOne({ token: refreshToken, userId: user._id.toString() });
    if (!stored || stored.isRevoked) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 3) 기존 토큰 만료 처리
    await this.refreshTokenModel.updateOne({ _id: stored._id }, { $set: { isRevoked: true } });

    // 4) 새로운 토큰 발급
    const tokens = await this.generateTokens(user);

    // 5) DB에 새로운 refreshToken 저장
    await this.saveRefreshToken(tokens.refreshToken, user._id.toString());

    return tokens;
  }

  /**
   * 토큰 생성 메소드
   * @private
   */
  private async generateTokens(user: UserDocument): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: TokenPayload = {
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME,
    });
    return { accessToken, refreshToken };
  }

  /**
   * 리프레시 토큰 저장 메소드
   * @private
   */
  private async saveRefreshToken(token: string, userId: string): Promise<void> {
    await this.refreshTokenModel.create({ token, userId, issuedAt: new Date(), isRevoked: false });
  }
}
