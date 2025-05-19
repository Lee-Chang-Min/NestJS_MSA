// gateway-server/src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../decorators/role.enum';
import { ROLES_KEY } from '../decorators/role.decorator';
import { AuthenticatedRequest } from 'apps/auth-server/src/auth/auth.controller';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. @Roles() 데코레이터로 핸들러에 설정된 필요한 역할(들)을 가져옵니다.
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);

    // 만약 @Roles() 데코레이터가 없다면, 해당 라우트는 역할 검사가 필요 없는 것으로 간주.
    if (!requiredRoles || requiredRoles.length === 0) {
      this.logger.debug('No specific roles required for this route. Access granted by RolesGuard.');
      return true;
    }

    // 2. JwtAuthGuard에 의해 req.user에 담긴 사용자 정보를 가져옵니다.
    //    req.user 객체에는 roles 프로퍼티가 배열 형태로 포함되어 있어야 합니다 (JwtStrategy의 validate 반환값).
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user; // 예: { email: '...', role: [Role.USER] }

    if (!user || !user.role) {
      this.logger.warn('User information or roles not found in request. Access denied by RolesGuard.');
      // 이 경우는 JwtAuthGuard가 제대로 작동하지 않았거나, JwtStrategy의 validate 메소드 반환값에 roles가 없는 경우
      throw new ForbiddenException('사용자 역할 정보를 확인할 수 없습니다.');
    }

    this.logger.debug(`Required roles: ${requiredRoles.join(', ')}. User roles: ${user.role}`);

    // 3. 사용자의 역할 중 하나라도 필요한 역할과 일치하는지 확인
    const hasRequiredRole = requiredRoles.some((role) => user.role.includes(role));

    if (hasRequiredRole) {
      this.logger.debug('User has required role(s). Access granted by RolesGuard.');
      return true;
    } else {
      this.logger.warn(
        `User does not have required role(s). Access denied by RolesGuard. Required: ${JSON.stringify(requiredRoles)}, User has: ${user.role}`,
      );
      throw new ForbiddenException('이 작업에 대한 권한이 없습니다.');
    }
  }
}
