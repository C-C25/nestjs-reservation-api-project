import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';
import { SpacesService } from '../src/spaces/spaces.service';
import request from 'supertest';
import { SpacesEntity } from '../src/spaces/entities/spaces.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('ReservationController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let usersService: UsersService;
  let spacesService: SpacesService;
  let testSpace: SpacesEntity;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    usersService = moduleFixture.get<UsersService>(UsersService);
    spacesService = moduleFixture.get<SpacesService>(SpacesService);

    const uniqueId = Date.now();
    const testUser = await usersService.createUser({
      email: `e2e-test${uniqueId}@test.com`,
      password: `test1234!`,
      nickname: `e2e-테스터${uniqueId}`,
    });

    const tokens = await authService.loginUser(testUser);
    accessToken = tokens.accessToken;

    testSpace = await spacesService.createSpace(testUser.id, {
      title: 'e2eTestTitle',
      content: 'e2eTestContent',
      address: 'e2eTestAddress',
      contact: '010-1234-1234',
      pricePerHour: 123,
      maxCapacity: 3,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('테스트용 앱이 정상적으로 초기화 된다.', () => {
    expect(app).toBeDefined();
    expect(accessToken).toBeDefined();
  });

  it('같은 시간대에 겹치는 예약을 동시에 시도하면 하나만 성공한다.', async () => {
    const startTime = '2026-11-01T10:00:00Z';
    const endTime = '2026-11-01T11:00:00Z';

    const requestA = request(app.getHttpServer())
      .post(`/reservations/${testSpace.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ startTime, endTime, content: 'A예약' });

    const requestB = request(app.getHttpServer())
      .post(`/reservations/${testSpace.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ startTime, endTime, content: 'B예약' });

    const [resultA, resultB] = await Promise.all([requestA, requestB]);

    const statusCodes = [resultA.status, resultB.status].sort();
    expect(statusCodes).toEqual([201, 400]);
  });
});
