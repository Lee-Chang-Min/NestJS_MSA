import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'refreshToken',
    description: '갱신 토큰',
    required: true,
  })
  @IsString()
  refreshtoken: string;
}
