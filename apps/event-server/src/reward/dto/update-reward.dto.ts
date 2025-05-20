import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateRewardDto } from './create-reward.dto';

/**
 * 보상 정보 수정을 위한 DTO입니다.
 * CreateRewardDto의 모든 필드를 선택적으로 만들고 (PartialType),
 * eventId 필드는 제외합니다 (OmitType).
 *
 * 수정 가능한 필드 예시:
 * - name?: string;
 * - type?: RewardType;
 * - details?: Record<string, any>;
 * - quantity?: number;
 * - stock?: number | null;
 * - metadata?: Record<string, any>;
 */
export class UpdateRewardDto extends OmitType(
  PartialType(CreateRewardDto),
  ['eventId'] as const, // eventId 필드를 수정 대상에서 제외
) {}
