import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  userID: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    const accessJwtSecret = configService.get<string>('JWT_SECRET');
    const refreshJwtSecret = configService.get<string>('JWT_REFRESH_SECRET');
    if (!accessJwtSecret || !refreshJwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: accessJwtSecret,
    });
  }

  validate(payload: JwtPayload) {
    return { userID: payload.userID, role: payload.role };
  }
}
