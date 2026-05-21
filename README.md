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

## ERD
![ERD](../docs/erd.png)

## 아키텍처

### 인증 흐름
1. 클라이언트가 로그인 요청 액션을 보낸다.
2. BasicTokenGuard에서 email/password 검증
3. JWT Access/Refresh token 발급 
4. 이후 요청마다 AccessTokenGuard에서 토큰 검증
5. RoleGuard에서 권한 확인

### 모듈 구조
- AuthModule: 인증/인가
- UsersModule: 유저 관리
- SpacesModule: 공간 관리
- ReservationsModule: 예약 관리
- ChatsModule: 채팅방 관리
- MessagesModule: 메세지 관리
- ReviewsModule: 리뷰 관리
- CommonModule: 공통 라우트 기능 (Pagination)

## API 명세

### Auth
| Method | URL                  | 설명                   | 인증 |
| ------ | -------------------- | ---------------------- | ---- |
| POST   | /auth/register/email | 회원가입               | X    |
| POST   | /auth/login/email    | 로그인                 | X    |
| POST   | /auth/token/access   | refresh = access 발급  | x    |
| POST   | /auth/token/refresh  | refresh = refresh 발급 | x    |

### Spaces
| Method | URL         | 설명           | 인증  |
| ------ | ----------- | -------------- | ----- |
| GET    | /spaces     | 공간 전체 조회 | x     |
| GET    | /spaces/:id | 공간 단일 조회 | x     |
| POST   | /spaces     | 공간 등록      | ADMIN |
| PATCH  | /spaces/:id | 공간 수정      | ADMIN |
| DELETE | /spaces/:id | 공간 삭제      | ADMIN |

### Reservations
| Method | URL                          | 설명           | 인증        |
| ------ | ---------------------------- | -------------- | ----------- |
| GET    | /reservations                | 예약 전체 조회 | AccessToken |
| POST   | /reservations/:spaceId       | 예약 생성      | AccessToken |
| PATCH  | /reservations/:reservationId | 예약 상태 변경 | ADMIN       |

### Reviews
| Method | URL                 | 설명           | 인증        |
| ------ | ------------------- | -------------- | ----------- |
| GET    | /reviews            | 리뷰 전체 조회 | x           |
| POST   | /reviews/:spaceId   | 리뷰 생성      | AccessToken |
| PATCH  | /reviews/:reviewsId | 리뷰 수정      | AccessToken |
| DELETE | /reviews/:reviewsId | 리뷰 삭제      | AccessToken |

### Chats
| Method | URL    | 설명        | 인증        |
| ------ | ------ | ----------- | ----------- |
| GET    | /chats | 채팅방 조회 | AccessToken |

### WebSocket (ws://localhost:3000/chats)
| 이벤트          | 설명        | 방향             |
| --------------- | ----------- | ---------------- |
| join_room       | 채팅방 입장 | client -> server |
| send_message    | 메시지 전송 | client -> server |
| receive_message | 메세지 수신 | server -> client |

## 트러블슈팅

### 전역 Guard 등록 시 의존성 주입 에러
- 문제: APP_GUARD로 AccessTokenGuard 전역 등록 시 AuthService를 찾지 못하는 에러 발생
- 원인: AppModule에서 AuthModule 내부의 AuthService에 접근 불가
- 해결: AuthModule의 exports에 AuthService 추가

### 낙관적 락(Optimistic Lock) 사용시 에러
- 문제: @VersionColumn() 사용시 에러 발생
- 원인: NestJS 에서 제대로 작동 하지 않아서 생김
- 해결: 비관적 락(Pessimistic Lock)으로 대처

### RefreshTokenGuard @IsPublic() 누락으로 인한 인증 에러
- 문제: @IsPublic() 누락 으로 토큰 갱신 엔드포인트 에서 인증 에러 발생
- 원인: 서버가 @IsPublic()이 refresh 을 인지 하지 못해서 터짐
- 해결: @IsPublic() 을 사용 할수 있도록 버그 수정

## 실행 방법
1. 레포지토리 클론
`git clone https://github.com/C-C25/nestjs-reservation-api-project.git`
`cd nestjs-reservation-api-project`

2. 패키지 설치
`yarn install`

3. .env 설정
`cp .env.sample .env`
.env 파일에 DB, JWT 관련 값 입력

4. Docker 실행 
`docker compose up -d`

5. 서버 실행
`yarn start:dev`