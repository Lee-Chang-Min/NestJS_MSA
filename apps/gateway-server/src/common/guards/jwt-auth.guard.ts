// apps/gateway-server/src/common/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

/** @Public() 메타데이터 키 */
export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);
  constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * - @Public() 데코레이터가 붙은 핸들러/클래스는 JWT 검증을 건너뜀
   * - 그렇지 않으면 기본 AuthGuard('jwt') 로직 수행
   */
  canActivate(ctx: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (isPublic) {
      return true;
    }
    this.logger.debug('JwtAuthGuard canActivate');
    return super.canActivate(ctx);
  }
}
