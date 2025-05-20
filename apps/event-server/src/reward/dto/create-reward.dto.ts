import { IsString, IsNotEmpty, IsEnum, IsMongoId, IsObject, IsInt, Min, IsOptional, MaxLength } from 'class-validator';
import { RewardType } from '../schemas/reward.schema';

export class CreateRewardDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEnum(RewardType, { message: '유효한 보상 타입이 아닙니다.' })
  @IsNotEmpty()
  type: RewardType;

  @IsMongoId({ message: '유효한 이벤트 ID 형식이 아닙니다.' })
  @IsNotEmpty()
  eventId: string; // 스키마에서는 ObjectId로 변환됩니다.

  @IsObject()
  @IsNotEmpty()
  details: Record<string, any>;

  @IsInt({ message: '수량은 정수여야 합니다.' })
  @Min(1, { message: '수량은 1 이상이어야 합니다.' })
  @IsOptional() // 스키마에 default: 1 이 있으므로 DTO에서는 선택적으로 만듭니다.
  quantity?: number; // 기본값은 스키마에서 1로 설정됨

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>; // 스키마에 default: {}
}
