import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserDocument } from '../users/schemas/users.schema';
import { UsersService } from '../users/users.service';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  /**
   * 사용자 회원가입 처리
   */
  async register(createUserDto: CreateUserDto): Promise<UserDocument> {
    const user = await this.usersService.create(createUserDto);
    return user;
  }

  /**
   * 사용자 검증
   * @return 검증된 User 객체
   * @param signInUserDto LoginDto
   */
  async verifyUser(LoginDto: LoginDto): Promise<UserDocument> {
    const user = await this.usersService.findByEmail(LoginDto.email);
    if (!user) {
      throw new UnauthorizedException('username or password is wrong');
    }

    // 비밀번호 검증
    const isPasswordValid = await user.comparePassword(LoginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('username or password is wrong');
    }

    return user;
  }

  /**
   * 사용자 로그인 처리
   */
  async login(
    user: UserDocument,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // JWT 토큰 발급
    const payload = {
      userId: user._id.toString(),
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME,
    });

    //refreshToken 저장
    await this.userModel.findByIdAndUpdate(user._id, {
      $set: { refreshToken },
    });

    return { accessToken, refreshToken };
  }
}

// /**
//  * 로그아웃 처리
//  */
//   async logout(user: UserDocument): Promise<void> {
//     // 토큰 블랙리스트 처리 
//     await this.jwtService.addTokenToBlacklist(user.refreshToken);
//   }
// }
