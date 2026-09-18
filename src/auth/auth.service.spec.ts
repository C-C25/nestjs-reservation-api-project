import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { REDIS_CLIENT } from '../redis/redis.module';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: any;
  let mockJwtService: any; // jwt 라이브러리 Service
  let mockConfigService: any; // config 라이브러리 Service
  let mockRedisClient: any; // Redis 라이브러리 에 있는 Client

  beforeEach(async () => {
    mockUsersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      createUser: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(), // jwtService를 불러와 실제 사용하는 메서드
      verify: jest.fn(), // jwtService를 불러와 실제 사용하는 메서드
    };

    mockConfigService = {
      get: jest.fn(),
    };

    mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: REDIS_CLIENT, useValue: mockRedisClient }, // 클래스가 아닌 토큰
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('authenticateWithEmailAndPassword', () => {
    it('이메일과 비밀번호가 일치하면 유저 정보를 반환한다.', async () => {
      const existingUser = {
        email: 'test@email.com',
        password: 'hashedPassword123', // DB에 저장된 해시 된 값
      };
      const loginUser = {
        email: 'test@email.com',
        password: 'plainPassword123', // 평문으로 들어온 비밀번호 값
      };

      mockUsersService.findByEmail.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // 평문과 해시를 비교 했더니 일치 한다.

      const result = await service.authenticateWithEmailAndPassword(loginUser); // 실제로 로그인 시도하는 입력값을 넘긴다.

      expect(result).toEqual(existingUser);
    });

    it('유저가 존재 않으면 BadRequestException(를)을 던진다.', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const loginUser = { email: 'test@email.com', password: 'password123' };

      await expect(
        service.authenticateWithEmailAndPassword(loginUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('비밀번호가 일치 하지 않으면 BadRequestException(를)을 던진다.', async () => {
      const existingUser = {
        email: 'test@email.com',
        password: 'hashedPassword123', // 해생된 비밀번호
      };
      const loginUser = {
        email: 'test@email.com',
        password: 'NotPassword123', // 틀린 비밀번호
      };

      mockUsersService.findByEmail.mockResolvedValue(existingUser); // 비밀번호 만 틀렷다는 가정을 넣기 위해 email 검증은 통과 되었다는 유무 확인함
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // 평문 해시를 비교 했더니 틀렸다.

      await expect(
        service.authenticateWithEmailAndPassword(loginUser),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
