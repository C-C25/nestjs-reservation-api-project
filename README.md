# 소규모 프라이빗 운동 공간 예약 서비스

## 프로젝트 소개
해당 프로젝트 컨셉은 예약제 헬스장 컨셉입니다. 예를 들어 당일은 하체 운동을 하는 날입니다. 헬스장에 방문했을 때 이미 하체 운동하는 사람이 많다면 시간이 소요되고 그 시간 동안 다른 걸 하느라 늦게 운동을 마치는 경험을 한 번쯤 해보신 적 있으신가요?. 이런 불편을 해소하기 위해 시간 단위로 공간을 단독으로 예약할 수 있는 서비스를 만들었습니다.

## 프로젝트 핵심 기능
1. 시간 슬릇 조회 및 예약
2. 예약 확정 (관리자 승인)
3. 예약 확정 시 채팅룸 자동 생성
4. 예약 시간 전 알림
5. 예약 내 관리자 <-> 사용자 실시간 채팅

## 기술 스택
- **Runtime**: Node.js
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **인증**: Passport, JWT
- **실시간 통신**: WebSocket (Socket.io)
- **스케줄러**: @nestjs/schedule
- **컨테이너**: Docker

## ERD (Entity 설계)
- User -- OneToMany -- Reservation
- User -- OneToMany -- Review
- User -- OneToMany -- Space
- User -- OneToMany -- Message

- Space -- OneToMany -- Reservation
- Space -- OneToMany -- Review

- Reservation -- OneToOne -- Chat

- Chat --One ToMany -- Message

## 트러블슈팅

### 전역 Guard 등록 시 의존성 주입 에러
- 문제: APP_GUARD로 AccessTokenGuard 전역 등록 시 AuthService를 찾지 못하는 에러 발생
- 원인: AppModule에서 AuthModule 내부의 AuthService에 접근 불가
- 해결: AuthModule의 exports에 AuthService 추가

## 실행 방법