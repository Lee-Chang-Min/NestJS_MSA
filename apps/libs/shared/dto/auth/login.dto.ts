import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'test@example.com',
    description: '사용자 이메일 주소',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123!',
    description: '사용자 비밀번호',
    required: true,
  })
  @IsString()
  password: string;
}
