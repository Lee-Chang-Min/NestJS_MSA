import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus } from '../schemas/event.schema';
export class FindEventsQueryDto {
  /**
   * 필터링할 이벤트 상태
   */
  @IsOptional()
  @IsEnum(EventStatus, {
    message: `유효한 이벤트 상태가 아닙니다. 사용 가능한 상태: ${Object.values(EventStatus).join(', ')}`,
  })
  readonly status?: EventStatus;

  /**
   * 페이지 번호 (1부터 시작)
   */
  @IsOptional()
  @Type(() => Number) // 문자열로 들어오는 쿼리 파라미터를 숫자로 변환
  @IsInt({ message: '페이지 번호는 정수여야 합니다.' })
  @Min(1, { message: '페이지 번호는 1 이상이어야 합니다.' })
  readonly page?: number = 1;

  /**
   * 한 페이지에 보여줄 항목 수
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '페이지 당 항목 수는 정수여야 합니다.' })
  @Min(1, { message: '페이지 당 항목 수는 1 이상이어야 합니다.' })
  @Max(100, { message: '페이지 당 항목 수는 최대 100개까지 요청 가능합니다.' }) // 과도한 데이터 요청 방지
  readonly limit?: number = 10;

  /**
   * 정렬 기준 필드
   * 예: 'createdAt', 'name', 'startDate'
   * 기본값: 'createdAt'
   */
  @IsOptional()
  @IsString({ message: '정렬 기준 필드는 문자열이어야 합니다.' })
  readonly sortBy?: string = 'createdAt';

  /**
   * 정렬 순서
   * 'ASC' (오름차순) 또는 'DESC' (내림차순)
   * 기본값: 'DESC'
   */
  @IsOptional()
  @IsEnum(['ASC', 'DESC'], { message: "정렬 순서는 'ASC' 또는 'DESC' 중 하나여야 합니다." })
  readonly sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
