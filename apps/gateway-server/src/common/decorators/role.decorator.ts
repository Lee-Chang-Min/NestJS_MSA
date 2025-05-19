// gateway-server/src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from './role.enum'; // 바로 위에서 정의한 Role enum import

/**
 * 라우트 핸들러에 접근하는 데 필요한 역할을 지정하는 커스텀 데코레이터입니다.
 * 예: @Roles(Role.ADMIN, Role.OPERATOR)
 *
 * @param role 접근을 허용할 역할(들)
 */
export const ROLES_KEY = 'role'; // 메타데이터 키로 사용될 문자열
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
