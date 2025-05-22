<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

## 소개

안녕하세요. 이번 과제를 맡게된 백엔드 개발자 이창민입니다.

📋 [**저를 소개 합니다:)** ](https://respected-wasp-a92.notion.site/174bfc29a92f80b5bf78e73500262c17)

## 🛠️ 프로젝트 설정

### 1️⃣ 패키지 설치
```bash
pnpm install
```

### 2️⃣ 도커 컨테이너 실행
```bash
docker compose up -d --build
```

### 3️⃣ 참고 자료
- **설정 및 명령어:** `package.json` 및 `command.txt` 파일 참고해주세요.
- **API 테스트:** Postman으로 쉽게 테스트할 수 있도록 `maplestory.postman_collection.json` 파일을 제공합니다.
  *(시간 관계상 Swagger 문서를 작성하지 못했습니다.)*

## 프로젝트 구조

```
apps/
├── auth-server/                   # 인증 및 사용자 관리 서비스
│   ├── src/
│   │   ├── auth/                  # 인증 관련 모듈
│   │   │   ├── dto/               # 데이터 전송 객체
│   │   │   ├── schemas/           # MongoDB 스키마
│   │   │   ├── strategies/        # JWT 인증 전략
│   │   │   ├── guards/            # 인증 가드
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.controller.ts
│   │   ├── users/                 # 사용자 관리 모듈
│   │   │   ├── dto/               # 데이터 전송 객체
│   │   │   ├── schemas/           # 사용자 스키마
│   │   │   ├── users.module.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.controller.ts
│   │   ├── database/              # 데이터베이스 설정
│   │   │   └── database.module.ts
│   │   ├── common/                # 공통 유틸리티
│   │   │   ├── decorators/        # 커스텀 데코레이터
│   │   │   └── filters/           # 예외 필터
│   │   ├── utils/                 # 유틸리티 함수
│   │   ├── app.module.ts          # 루트 모듈
│   │   └── main.ts                # 앱 진입점
│   ├── test/                      # 테스트 코드
│   │   ├── auth.e2e-spec.ts       # 인증 E2E 테스트
│   │   └── users.e2e-spec.ts      # 사용자 E2E 테스트
│   └── Dockerfile                 # 도커 설정
│
├── gateway-server/                # API 게이트웨이 서비스
│   ├── src/
│   │   ├── common/                # 공통 유틸리티
│   │   │   ├── decorators/        # 커스텀 데코레이터
│   │   │   │   ├── public.decorator.ts # 공개 API 표시 데코레이터
│   │   │   │   ├── role.decorator.ts   # 역할 지정 데코레이터
│   │   │   │   └── role.enum.ts        # 역할 열거형(USER, OPERATOR, AUDITOR, ADMIN)
│   │   │   ├── guards/            # 보안 가드
│   │   │   │   ├── jwt-auth.guard.ts   # JWT 인증 가드
│   │   │   │   └── role.guard.ts       # 역할 기반 접근 제어 가드
│   │   │   ├── filters/           # 예외 필터
│   │   │   ├── interceptors/      # 인터셉터
│   │   │   └── strategies/        # 인증 전략
│   │   │       └── jwt.strategy.ts    # JWT 검증 전략
│   │   ├── microservices/         # 마이크로서비스 연결 모듈
│   │   │   ├── client-proxy.provider.ts # 마이크로서비스 프록시 제공자
│   │   │   └── client.module.ts   # 글로벌 클라이언트 모듈
│   │   ├── modules/               # 기능별 모듈
│   │   │   ├── auth-proxy/        # 인증 프록시 모듈
│   │   │   │   ├── auth-proxy.controller.ts # 인증 API 엔드포인트
│   │   │   │   └── auth-proxy.module.ts     # 인증 프록시 모듈 정의
│   │   │   └── event-proxy/       # 이벤트 프록시 모듈
│   │   │       ├── event-proxy.controller.ts # 이벤트 API 엔드포인트
│   │   │       └── event-proxy.module.ts     # 이벤트 프록시 모듈 정의
│   │   ├── middleware/            # 미들웨어
│   │   │   ├── logger.middleware.ts # 로깅 미들웨어
│   │   │   └── auth.middleware.ts # 인증 미들웨어
│   │   ├── app.module.ts          # 루트 모듈
│   │   └── main.ts                # 앱 진입점
│   ├── test/                      # 테스트 코드
│   │   └── gateway.e2e-spec.ts    # 게이트웨이 E2E 테스트
│   ├── Dockerfile                 # 도커 설정
│   └── tsconfig.app.json          # TypeScript 설정
│
├── event-server/                  # 이벤트 관리 서비스
│   ├── src/
│   │   ├── event/                 # 이벤트 관련 모듈
│   │   │   ├── dto/               # 데이터 전송 객체
│   │   │   ├── schemas/           # MongoDB 스키마
│   │   │   ├── event.module.ts
│   │   │   ├── event.service.ts
│   │   │   └── event.controller.ts # RPC 컨트롤러
│   │   ├── reward/                # 보상 관련 모듈
│   │   │   ├── dto/               # 데이터 전송 객체
│   │   │   ├── schemas/           # MongoDB 스키마
│   │   │   ├── reward.module.ts
│   │   │   ├── reward.service.ts
│   │   │   └── reward.controller.ts # RPC 컨트롤러
│   │   ├── database/              # 데이터베이스 설정
│   │   │   └── database.module.ts
│   │   ├── common/                # 공통 유틸리티
│   │   │   ├── decorators/        # 커스텀 데코레이터
│   │   │   └── filters/           # 예외 필터
│   │   ├── utils/                 # 유틸리티 함수
│   │   │   └── date.util.ts       # 날짜 관련 유틸
│   │   ├── app.module.ts          # 루트 모듈
│   │   └── main.ts                # 앱 진입점
│   ├── test/                      # 테스트 코드
│   │   ├── event.e2e-spec.ts      # 이벤트 E2E 테스트
│   │   └── reward.e2e-spec.ts     # 보상 E2E 테스트
│   └── Dockerfile                 # 도커 설정
│
└── libs/                          # 공유 라이브러리
    └── shared/                    # 여러 서비스에서 공유하는 코드
        ├── dto/                   # 공유 DTOO
        ├── interfaces/            # 공유 인터페이스
        ├── constants/             # 공유 상수
        └── utils/                 # 공유 유틸리티
```

## 아키텍처 구성

1. **MSA 패턴**: 각 서비스가 독립적으로 동작하는 마이크로서비스 아키텍처
   - 인증 서비스, 이벤트 서비스, 게이트웨이 서비스로 분리
   - 모듈성과 확장성 강화

2. **API 게이트웨이 패턴**:
   - 모든 클라이언트 요청이 단일 진입점(게이트웨이)을 통해 라우팅됨
   - 클라이언트에게 통합된 API 인터페이스 제공

3. **RPC 통신 방식**: 
   - MessagePattern 데코레이터를 통한 RPC 스타일 통신
   - 게이트웨이 서버와 각 마이크로서비스 간 메시지 교환
   - TCP 트랜스포트 사용으로 신뢰성 있는 통신

4. **데이터베이스**: 
   - MongoDB를 사용한 NoSQL 데이터 저장소
   - 각 서비스별 독립적인 스키마 구성

5. **인증 흐름**:
   - JWT 기반 인증 시스템
   - 액세스 토큰 및 리프레시 토큰 관리


## 몽고 DB Schema 설계

### 사용자 관리 (User)

```typescript
{
  _id: ObjectId,
  email: String,        // 필수, 소문자 변환, 트림
  username: String,     // 필수, 고유값, 트림
  password: String,     // 필수, bcrypt 해시 처리됨
  role: Enum(USER, OPERATOR, AUDITOR, ADMIN),  // 기본값: USER
  createdAt: Date,      // 자동 생성
  updatedAt: Date       // 자동 생성
}
```

- 비밀번호는 저장 전 bcrypt로 해시 처리됨
- 이메일 인덱스 설정으로 조회 성능 최적화
- 역할 기반 접근 제어 지원 (RBAC)

### 리프레시 토큰 (RefreshToken)

```typescript
{
  _id: ObjectId,
  userID: ObjectId,    // User 참조, 필수
  token: String,       // 필수, 고유값
  issuedAt: Date,      // 필수
  isRevoked: Boolean,  // 기본값: false
  userAgent: String,   // 옵션
  ipAddress: String,   // 옵션
  createdAt: Date,     // 자동 생성
  updatedAt: Date      // 자동 생성
}
```

- RoR 패턴 적용, RefreshToken 블랙리스트 관리
- 토큰과 사용자ID에 인덱스 설정으로 빠른 조회 지원
- 추후 다중 디바이스 로그인 및 세션 관리 지원 고려

### 이벤트 관리 (Event)

```typescript
{
  _id: ObjectId,
  name: String,                // 필수, 트림
  description: String,         // 옵션, 트림
  conditions: [{               // 이벤트 참여 조건
    type: String,              // 조건 유형(예: LOGIN_DAYS, INVITE_FRIEND)
    params: Object             // 조건별 파라미터
  }],
  startDate: Date,             // 필수
  endDate: Date,               // 필수
  status: Enum(ACTIVE, UPCOMING, EXPIRED),  // 기본값: UPCOMING
  createdBy: ObjectId,         // 생성한 관리자/운영자 참조, 필수
  createdAt: Date,             // 자동 생성
  updatedAt: Date              // 자동 생성
}
```

### 보상 관리 (Reward)

```typescript
{
  _id: ObjectId,
  name: String,                // 필수, 트림
  type: Enum(POINT, ITEM, COUPON),  // 필수
  eventId: ObjectId,           // Event 참조, 필수
  details: Object,             // 보상 유형별 상세 정보, 필수
  quantity: Number,            // 수량, 기본값: 1, 최소값: 1
  stock: Number,               // 재고, 옵션, 기본값: null
  metadata: Object,            // 확장 정보, 기본값: {}
  createdAt: Date,             // 자동 생성
  updatedAt: Date              // 자동 생성
}
```

### 이벤트 진행 상태 (EventProgress)

```typescript
{
  _id: ObjectId,
  userId: ObjectId,            // User 참조, 필수, 인덱스
  eventId: ObjectId,           // Event 참조, 필수, 인덱스
  eventConditionIndex: Number, // 이벤트 조건 배열 내 인덱스, 필수
  progress: Object,            // 조건 진행 상태 (동적 구조), 필수
  isCompleted: Boolean,        // 조건 완료 여부, 기본값: false
  createdAt: Date,             // 자동 생성
  updatedAt: Date              // 자동 생성
}
```

### 보상 요청 처리 (RewardClaim)

```typescript
{
  _id: ObjectId,
  userId: ObjectId,            // User 참조, 필수, 인덱스
  eventId: ObjectId,           // Event 참조, 필수, 인덱스
  rewardId: ObjectId,          // Reward 참조, 필수
  claimedQuantity: Number,     // 수령한 보상 개수, 기본값: 1, 최소값: 1
  status: Enum(PENDING_APPROVAL, AUTO_APPROVED, REJECTED, SUCCESS, ERROR), // 기본값: PENDING_APPROVAL
  resolutionNotes: String,     // 처리 결과 노트 (예: 거절 사유), 옵션
  processedBy: ObjectId,       // 처리한 관리자/운영자 참조, 옵션
  processedAt: Date,           // 처리 시간, 옵션
  createdAt: Date,             // 자동 생성
  updatedAt: Date              // 자동 생성
}
```



## HISTORY

#### 프로젝트 설계할때 과하게 폴더 구조화 하지 않고 최대한 직관적으로 빠르게 파악 할 수 있게 구조화 하는게 가장 큰 목표로 하였습니다.

#### MSA 멀티 VS 모노레포 프로젝트 구조 선택 이유

- 과제 에서 구축해야하는 서비스 규모와 중복 코드를 최소화 하고 확장성을 고려하여 멀티 모노레포 프로젝트 구조를 선택하였습니다.


#### JWT 토큰 userID 보안 강화 고민

- ROR(Refresh On Rotation) 패턴 도입: 리프레시 토큰 사용 시마다 새로운 토큰을 발급하고 이전 토큰을 즉시 무효화하여 재사용 방지

- JWT 리프레시 토큰 블랙리스트 관리: 탈취되거나 만료된 토큰의 JTI를 Redis/DB에 저장해 인증 시 조회함으로써 불법 사용 차단

#### Gateway Server 구현 및 메서드 호출 방식 고민

#### 1. RPC 패턴 도입
- **동기 통신 방식**으로 서비스 간 응답 흐름을 명확하게 관리
- 트랜잭션 경계 처리와 오류 전파가 **직관적**이고 **예측 가능**

#### 2. 비동기 로직 고도화
- 이벤트 처리량 증가 대비하여 **Kafka / RabbitMQ** 도입 고려

## 🔧 개선하고 싶은 점

### 1. 기술적 부족 요소
- **Swagger 문서화 부족**
- **테스트 코드 미작성**

### 2. 구현 미비 영역
- `/event-server/src/reward-claim` 디렉토리 내:
  - **보상 요청 처리 및 내역 확인 로직** 미완성
  - 프로젝트 초기 구조 설계에 시간을 많이 소비하여, 해당 로직에서 구현하지 못한 것이 아쉽습니다. => CQRS 패턴 적용
    - **DB 동시성 제어** 전략: 비관적 락 vs 낙관적 락
    - **중복 요청 방지 및 재처리 정책** 
    - **정합성 유지를 위한 트랜잭션 처리**
    - 대량 트레픽에 대한 Redis 분산 락 적용 고려
