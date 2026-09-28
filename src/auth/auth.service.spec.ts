import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { REDIS_CLIENT } from '../redis/redis.module';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
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
  describe('loginWithEmail', () => {
    it('인증에 성공하면 로그인 처리 결과를 반환한다', async () => {
      const loginUser = {
        email: 'test@email.com',
        password: 'testPass123',
      }; // loginWithEmail 에 필요한 email, password 값,
      const authenticatedUser = {
        id: 1,
        email: 'test@email.com',
      }; // 저 값을 authenticateEmailAndPassword에 가져올 값.
      const loginResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }; // loginUser에 보낼값 을 정의하고,.

      jest
        .spyOn(service, 'authenticateWithEmailAndPassword')
        .mockResolvedValue(authenticatedUser as any);
      jest.spyOn(service, 'loginUser').mockResolvedValue(loginResult as any);

      const result = await service.loginWithEmail(loginUser);

      expect(service.authenticateWithEmailAndPassword).toHaveBeenCalledWith(
        loginUser,
      );
      expect(service.loginUser).toHaveBeenCalledWith(authenticatedUser);
      expect(result).toEqual(loginResult);
    });
  });

  describe('registerWithEmail', () => {
    it('회원가입이 되면 로그인 시킨다.', async () => {
      const registerDto = {
        email: 'test@email.com',
        password: 'originPassword',
        nickName: 'test',
      }; // registerWithEmail 파라미터는 Dto(email, password, nickname), 생성은 user(createdUser)
      const hashPassword = 'hashedPassword123';
      const createdUser = {
        id: 1,
        email: 'test@email.com',
        password: hashPassword,
      };
      const loginResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockConfigService.get.mockReturnValue('10');
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashPassword); // hash가 되었다고 가정?
      mockUsersService.createUser.mockResolvedValue(createdUser);
      jest.spyOn(service, 'loginUser').mockResolvedValue(loginResult as any);

      const result = await service.registerWithEmail(registerDto as any);

      expect(mockUsersService.createUser).toHaveBeenCalledWith({
        ...registerDto,
        password: hashPassword,
      });
      expect(service.loginUser).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(loginResult);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('Header로 부터 토큰 발급 한다.', () => {
      // service code const splitToken = header.split(' ');
      // 띄어쓰기 기준으로 [0]번 과 [1]번 [0]은 토큰 타입
      const header = 'Bearer token';
      // service code = const prefix = isBearer ? 'Bearer' : 'Basic';
      const isBearer = true;

      const result = service.extractTokenFromHeader(header, isBearer);

      // const token = splitToken[1];

      // return token;
      expect(result).toEqual('token');
    });

    it('길이가 2가 아니면 UnauthorizedException', () => {
      const header = '';
      const isBearer = true;

      expect(() => service.extractTokenFromHeader(header, isBearer)).toThrow(
        UnauthorizedException,
      );
    });

    it('Bearer, Basic 이 아니라면 UnauthorizedException', () => {
      const header = 'notBearer token';
      const isBearer = true;

      expect(() => service.extractTokenFromHeader(header, isBearer)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('decodedBasicToken', () => {
    it('Base64 문자열을 디코딩 하고 utf8로 변환 한다.', () => {
      const base64 = Buffer.from('test@email.com:testPassword').toString(
        'base64',
      );

      const result = service.decodedBasicToken(base64);

      expect(result).toEqual({
        email: 'test@email.com',
        password: 'testPassword',
      });
    });

    it('email:password 형식이 아니라면 UnauthorizedException', () => {
      const invalidBase64 = Buffer.from('this-has-no-colon').toString('base64');

      expect(() => service.decodedBasicToken(invalidBase64)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('accessVerifyToken', () => {
    it('토큰이 유효 하면 디코딩된 payload를 반환한다,', () => {
      // token 을 생각 해보면, payload 를 형성을 어떻게 했는지 생각 해봐야 한다.
      // email, id(sub), tokenType, 이럼 토큰을 디코딩을 하게 된다면 payload 가 나온다.
      const decodedPayload = {
        sub: 1, // 순서도 지정했던 순서로
        email: 'test@email.com',
        tokenType: 'access',
      };
      mockJwtService.verify.mockReturnValue(decodedPayload);

      const result = service.accessVerifyToken('valid-token');

      expect(result).toEqual(decodedPayload);
    });

    it('토큰이 만료 되었다면 UnauthorizedException', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('token expired');
      });

      expect(() => service.accessVerifyToken('expired-token')).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshVerifyToken', () => {
    it('토큰이 유효 하면 디코딩 된 payload를 반화한다', () => {
      const decodedPayload = {
        sub: 1,
        email: 'test@email.com',
        tokenType: 'refresh',
      };

      mockJwtService.verify.mockReturnValue(decodedPayload);

      const result = service.refreshVerifyToken('valid-token');

      expect(result).toEqual(decodedPayload);
    });

    it('토큰이 만료 되었다면 UnauthorizedException', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('token expired');
      });

      expect(() => service.refreshVerifyToken('expired-token')).toThrow(
        UnauthorizedException,
      );
    });
  });
});
