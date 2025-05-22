import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; // API 문서화를 위해 Swagger 데코레이터 사용 (선택 사항)
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { Types } from 'mongoose';

export class CreateRewardClaimDto {
  @ApiProperty({
    description: '보상을 요청하는 사용자의 ID',
    example: '605c724f5e9f7f001f8e3c7a',
  })
  @IsNotEmpty({ message: '사용자 ID (userId)는 필수 항목입니다.' })
  @IsMongoId({ message: '사용자 ID (userId) 형식이 올바르지 않습니다.' })
  userId: Types.ObjectId; // 또는 string 타입으로 받고 서비스/핸들러에서 ObjectId로 변환할 수도 있습니다.

  @ApiProperty({
    description: '보상을 요청할 이벤트의 ID',
    example: '605c724f5e9f7f001f8e3c7b',
  })
  @IsNotEmpty({ message: '이벤트 ID (eventId)는 필수 항목입니다.' })
  @IsMongoId({ message: '이벤트 ID (eventId) 형식이 올바르지 않습니다.' })
  eventId: Types.ObjectId;

  @ApiProperty({
    description: '요청하는 보상의 ID',
    example: '605c724f5e9f7f001f8e3c7c',
  })
  @IsNotEmpty({ message: '보상 ID (rewardId)는 필수 항목입니다.' })
  @IsMongoId({ message: '보상 ID (rewardId) 형식이 올바르지 않습니다.' })
  rewardId: Types.ObjectId;

  @ApiPropertyOptional({
    description: '요청하는 보상의 수량 (기본값: 1)',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: '수량 (claimedQuantity)은 숫자여야 합니다.' })
  @Min(1, { message: '수량 (claimedQuantity)은 최소 1 이상이어야 합니다.' })
  claimedQuantity?: number;
}
