import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '../schemas/users.schema';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: '사용자 ID',
    example: '664664664664664664664664',
  })
  @IsNotEmpty()
  @IsString()
  userID: string;

  @ApiPropertyOptional({
    description: '사용자 역할',
    enum: UserRole,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: '새로운 비밀번호 (최소 8자 이상이어야 합니다)',
    example: 'newStrongPassword123',
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  password?: string;
}
