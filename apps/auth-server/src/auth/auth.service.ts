import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserDocument } from '../users/schemas/users.schema';
import { UsersService } from '../users/users.service';
import { RefreshToken, RefreshTokenDocument } from './schemas/refresh-token.schema';

export interface TokenPayload {
  userID: string;
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
    try {
      return this.usersService.create(createUserDto);
    } catch (error) {
      this.logger.error(`[register] Error registering user: ${error}`);
      throw error;
    }
  }

  /**
   * 사용자 검증
   * @return 검증된 User 객체
   * @param loginDto LoginDto
   */
  async verifyUser(loginDto: LoginDto): Promise<UserDocument> {
    try {
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
    } catch (error) {
      this.logger.error(`[verifyUser] Error verifying user: ${error}`);
      throw error;
    }
  }

  /**
   * 사용자 로그인 처리
   */
  async login(user: UserDocument): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // 토큰 생성
      const tokens = await this.generateTokens(user._id.toString(), user.role);
      // refreshToken 저장
      await this.saveRefreshToken(tokens.refreshToken, user._id.toString());

      return tokens;
    } catch (error) {
      this.logger.error(`[login] Error logging in: ${error}`);
      throw error;
    }
  }

  /**
   * 로그아웃 처리
   */
  async logout(userID: string): Promise<void> {
    try {
      // 토큰 블랙리스트 처리
      const user = await this.userModel.findById(userID);
      if (!user) {
        this.logger.warn(`로그아웃 시도: 존재하지 않는 ID ${userID}`);
        return;
      } else {
        await this.refreshTokenModel.updateOne({ userID: user._id.toString() }, { $set: { isRevoked: true } });
      }
    } catch (error) {
      this.logger.error(`[logout] Error logging out: ${error}`);
      throw error;
    }
  }

  /**
   * refreshToken 재발급
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // 1) 기존 refreshToken 유효성 검증
      const payload = this.jwtService.verify<TokenPayload>(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });

      // 2) DB에 저장된 토큰과 일치하는지 확인
      const stored = await this.refreshTokenModel.findOne({ token: refreshToken, userID: payload.userID });
      if (!stored || stored.isRevoked) {
        this.logger.warn(`[refreshToken] 이미 REVOKED 된 토큰입니다.`);
        throw new UnauthorizedException('Invalid refresh token');
      }

      // 3) 기존 토큰 만료 처리
      await this.refreshTokenModel.updateOne({ _id: stored._id }, { $set: { isRevoked: true } });

      // 4) 새로운 토큰 발급
      const tokens = await this.generateTokens(payload.userID, payload.role);

      // 5) DB에 새로운 refreshToken 저장
      await this.saveRefreshToken(tokens.refreshToken, payload.userID);

      return tokens;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        this.logger.warn(`[refreshToken] 유효하지 않은 토큰입니다.`);
        throw new UnauthorizedException('Invalid refresh token');
      }
      this.logger.error(`[refreshToken] Error refreshing token: ${error}`);
      throw error;
    }
  }

  /**
   * 토큰 생성 메소드
   * @private
   */
  private async generateTokens(userID: string, role: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload: TokenPayload = {
        userID,
        role,
      };

      const accessToken = await this.jwtService.signAsync(payload);
      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME,
      });
      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error(`[generateTokens] Error generating tokens: ${error}`);
      throw error;
    }
  }

  /**
   * 리프레시 토큰 저장 메소드
   * @private
   */
  private async saveRefreshToken(token: string, userID: string): Promise<void> {
    try {
      await this.refreshTokenModel.create({ token, userID: userID, issuedAt: new Date(), isRevoked: false });
    } catch (error) {
      this.logger.error(`[saveRefreshToken] Error saving refresh token: ${error}`);
      throw error;
    }
  }
}
