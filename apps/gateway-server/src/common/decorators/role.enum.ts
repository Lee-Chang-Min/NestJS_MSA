/**
 * 사용자 역할을 정의하는 열거형입니다.
 * 이 값들은 AuthServer에서 JWT 페이로드에 포함시키는 역할 문자열과 일치해야 합니다.
 */
export enum Role {
  USER = 'USER', // 일반 사용자 (보상 요청 가능)
  OPERATOR = 'OPERATOR', // 운영자 (이벤트/보상 등록)
  AUDITOR = 'AUDITOR', // 감사자 (보상 이력 조회만 가능)
  ADMIN = 'ADMIN', // 관리자 (모든 기능 접근 가능)
}
