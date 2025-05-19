// src/users/dto/create-user.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
// import { UserRole } from 'apps/auth-server/src/users/schemas/users.schema';
import { UserRole } from '../../../../auth-server/src/users/schemas/users.schema';

export class CreateUserDto {
  @ApiProperty({
    example: 'newuser@example.com',
    description: '사용자 이메일',
  })
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  @IsNotEmpty({ message: '이메일은 필수 항목입니다.' })
  email: string;

  @ApiProperty({
    example: 'test1',
    description: '사용자 계정명',
  })
  @IsString()
  @IsNotEmpty({ message: '사용자 이름은 필수 항목입니다.' })
  @MinLength(2, { message: '사용자 이름은 최소 2자 이상이어야 합니다.' })
  @MaxLength(20, { message: '사용자 이름은 최대 20자 이하이어야 합니다.' })
  username: string;

  @ApiProperty({
    example: 'password123',
    description: '사용자 비밀번호',
  })
  @IsString()
  @IsNotEmpty({ message: '비밀번호는 필수 항목입니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  password: string;

  @ApiProperty({
    example: 'ADMIN',
    description: '사용자 역할',
  })
  @IsString()
  @IsNotEmpty({ message: '역할은 필수 항목입니다.' })
  @IsEnum(UserRole, { message: '유효한 역할을 선택해주세요.' })
  role: UserRole;
}
