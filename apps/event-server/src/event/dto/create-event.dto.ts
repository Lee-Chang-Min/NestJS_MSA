import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum, IsObject, ValidateNested, IsMongoId, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus, EventApprovalType } from '../schemas/event.schema'; // 이전 단계에서 생성한 스키마의 Enum

// 이벤트 조건에 대한 DTO (필요에 따라 더 구체화 가능)
export class EventConditionDto {
  @IsString()
  @IsNotEmpty()
  type: string; // 예: "LOGIN_STREAK", "INVITE_FRIENDS"

  @IsObject()
  @IsNotEmpty()
  params: Record<string, any>; // 예: { "days": 3 }, { "count": 5 }
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  /**
   * 이벤트 참여 조건 배열
   * 예: [{ "type": "LOGIN_STREAK", "params": { "days": 3 } }]
   */
  @IsNotEmpty()
  @ValidateNested({ each: true }) // 배열의 각 요소에 대해 유효성 검사
  @Type(() => EventConditionDto) // 배열 요소의 타입 명시
  conditions: EventConditionDto[];

  @IsDateString()
  @IsNotEmpty()
  startDate: string; // ISO 8601 형식의 날짜 문자열 (예: "2025-12-31T15:00:00.000Z")

  @IsDateString()
  @IsNotEmpty()
  endDate: string; // ISO 8601 형식의 날짜 문자열

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus = EventStatus.UPCOMING; // 기본 상태를 UPCOMING으로 설정

  @IsEnum(EventApprovalType)
  @IsNotEmpty()
  approvalType: EventApprovalType;

  /**
   * 이벤트를 생성한 운영자/관리자의 User ID (Auth Server의 User ID)
   * Gateway에서 인증 후 요청자 정보를 받아와서 채워줄 수도 있고,
   * 클라이언트가 직접 보내는 경우 여기서 유효성 검사를 합니다.
   */
  @IsMongoId()
  @IsNotEmpty()
  createdBy: string; // ObjectId 형식의 문자열
}
