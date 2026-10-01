import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenGuard } from './guard/bearer_token.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      extractTokenFromHeader: jest.fn(),
      rotateAccessToken: jest.fn(),
      rotateRefreshToken: jest.fn(),
      registerWithEmail: jest.fn(),
      loginUser: jest.fn(),
      logout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockService }],
    })
      .overrideGuard(RefreshTokenGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });

  describe('postTokenAccess', () => {
    const tokenFromHeader = {
      token: 'bearer-token',
      isBearer: true,
    };

    const token = 'token';

    it('access Token 정상적으로 재발급 된다.', async () => {
      mockService.extractTokenFromHeader.mockReturnValue(tokenFromHeader);
      mockService.rotateAccessToken.mockResolvedValue(token);

      const rawToken = 'Bearer refresh-token';

      const result = await controller.postTokenAccess(rawToken);

      expect(mockService.extractTokenFromHeader).toHaveBeenCalledWith(
        rawToken,
        true,
      );
      expect(mockService.rotateAccessToken).toHaveBeenCalledWith(
        tokenFromHeader,
      );
      expect(result).toEqual({
        accessToken: token,
      });
    });
  });

  describe('postTokenRefresh', () => {
    const tokenFromHeader = {
      token: 'bearer-token',
      isBearer: true,
    };

    const token = 'token';

    it('refresh Token 정상적으로 재발급 된다.', async () => {
      mockService.extractTokenFromHeader.mockReturnValue(tokenFromHeader);
      mockService.rotateRefreshToken.mockResolvedValue(token);

      const rawToken = 'Bearer refresh-token';

      const result = await controller.postTokenRefresh(rawToken);

      expect(mockService.extractTokenFromHeader).toHaveBeenCalledWith(
        rawToken,
        true,
      );
      expect(mockService.rotateRefreshToken).toHaveBeenCalledWith(
        tokenFromHeader,
      );
      expect(result).toEqual({
        refreshToken: token,
      });
    });
  });

  describe('postRegister', () => {
    const dto = {
      email: 'test@email.com',
      password: 'testPass',
      nickname: 'testNickname',
    };

    it('회원가입이 정상적으로 된다.', async () => {
      mockService.registerWithEmail.mockResolvedValue({ ...dto });

      const result = await controller.postRegister(dto as any);

      expect(result).toEqual(dto);
    });
  });

  describe('postLogin', () => {
    const user = {
      email: 'test@email.com',
      password: 'testPass',
      nickname: 'testNickname',
    };
    const req = { user };
    const loginResult = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    it('로그인이 정상적으로 성공한다.', async () => {
      mockService.loginUser.mockResolvedValue(loginResult);

      const result = await controller.postLogin(req as any);

      expect(mockService.loginUser).toHaveBeenCalledWith(user);
      expect(result).toEqual(loginResult);
    });
  });

  describe('postLogout', () => {
    const req = { user: { id: 1 } };

    it('로그아웃이 정상적으로 성공한다.', async () => {
      mockService.logout.mockResolvedValue({ user: { id: 1 } });

      const result = await controller.postLogout(req as any);

      expect(result).toEqual({ user: { id: 1 } });
    });
  });
});
