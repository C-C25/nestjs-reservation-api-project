import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  ENV_HASH_ROUND_KEY,
  ENV_JWT_ACCESS_SECRET_KEY,
  ENV_JWT_REFRESH_SECRET_KEY,
} from '../common/const/env-keys-values.const';
import { UsersEntity } from '../users/entities/users.entity';
import { UsersService } from '../users/users.service';
import { RegisterAuthDto } from './dto/auth_register.dto';
import type { Cache } from 'cache-manager';
import { REDIS_CLIENT } from '../redis/redis.module';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersSevice: UsersService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  extractTokenFromHeader(header: string, isBearer: boolean) {
    const splitToken = header.split(' ');

    const prefix = isBearer ? 'Bearer' : 'Basic';

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException('잘못된 유형의 토큰입니다.');
    }

    const token = splitToken[1];

    return token;
  }

  docodedBasicToken(base64String: string) {
    const decoded = Buffer.from(base64String, 'base64').toString('utf8');

    const split = decoded.split(':');

    if (split.length !== 2) {
      throw new UnauthorizedException('잘못된 토큰입니다.');
    }

    const email = split[0];
    const password = split[1];

    return {
      email,
      password,
    };
  }

  accessVerifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>(ENV_JWT_ACCESS_SECRET_KEY),
      });
    } catch (e) {
      throw new UnauthorizedException('Access토큰이 만료되었습니다.');
    }
  }

  // refresh 토큰 검증
  refreshVerifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>(ENV_JWT_REFRESH_SECRET_KEY),
      });
    } catch (e) {
      throw new UnauthorizedException('Refresh토큰이 만료되었습니다.');
    }
  }

  async rotateAccessToken(token: string) {
    const decoded = this.jwtService.verify(token, {
      secret: this.configService.get<string>(ENV_JWT_REFRESH_SECRET_KEY),
    });

    if (decoded.tokenType !== 'refresh') {
      throw new UnauthorizedException(
        'accessToken은 refreshToken으로 발급 가능',
      );
    }

    const storedToken = await this.redisClient.get(
      `refresh_token_${decoded.sub}`,
    );

    if (!storedToken || storedToken !== token) {
      throw new UnauthorizedException(`유호하지 않은 RefreshToken입니다.`);
    }

    return this.accessSignToken({
      ...decoded,
    });
  }

  async rotateRefreshToken(token: string) {
    const decoded = this.jwtService.verify(token, {
      secret: this.configService.get<string>(ENV_JWT_REFRESH_SECRET_KEY),
    });

    if (decoded.tokenType !== 'refresh') {
      throw new UnauthorizedException(
        'refreshToken은 refreshToken으로만 발급 가능합니다.',
      );
    }

    const storedToken = await this.redisClient.get(
      `refresh_token_${decoded.sub}`,
    );

    if (!storedToken || storedToken !== token) {
      throw new UnauthorizedException('유효하지 않은 RefreshToken입니다.');
    }

    const newRefreshTokenn = this.refreshSignToken({
      ...decoded,
    });

    await this.redisClient.set(
      `refresh_token_${decoded.sub}`,
      newRefreshTokenn,
      `EX`,
      60 * 60 * 2,
    );

    return newRefreshTokenn;
  }

  private accessSignToken(user: Pick<UsersEntity, 'email' | 'id'>) {
    const accessPayload = {
      sub: user.id,
      email: user.email,
      tokenType: 'access',
    };

    return this.jwtService.sign(accessPayload, {
      secret: this.configService.get<string>(ENV_JWT_ACCESS_SECRET_KEY),
      expiresIn: '5m',
    });
  }

  private refreshSignToken(user: Pick<UsersEntity, 'email' | 'id'>) {
    const refreshPayload = {
      sub: user.id,
      email: user.email,
      tokenType: 'refresh',
    };

    return this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>(ENV_JWT_REFRESH_SECRET_KEY),
      expiresIn: '2h',
    });
  }

  async loginUser(user: Pick<UsersEntity, 'email' | 'id'>) {
    const refreshToken = this.refreshSignToken(user);

    await this.redisClient.set(
      `refresh_token_${user.id}`,
      refreshToken,
      'EX',
      60 * 60 * 2,
    );

    return {
      accessToken: this.accessSignToken(user),
      refreshToken,
    };
  }

  async authenticateWithEmailAndPassword(
    user: Pick<UsersEntity, 'email' | 'password'>,
  ) {
    const existingUser = await this.usersSevice.findByEmail(user.email);

    if (!existingUser)
      throw new BadRequestException('이메일 또는 비밀번호가 틀렸습니다.');

    const passOk = await bcrypt.compare(user.password, existingUser.password);

    if (!passOk)
      throw new BadRequestException('이메일 또는 비밀번호가 틀렸습니다..');

    return existingUser;
  }

  async loginWithEmail(user: Pick<UsersEntity, 'email' | 'password'>) {
    const existingUser = await this.authenticateWithEmailAndPassword(user);

    return await this.loginUser(existingUser);
  }

  async registerWithEmail(dto: RegisterAuthDto) {
    const hash = await bcrypt.hash(
      dto.password,
      parseInt(this.configService.get<string>(ENV_HASH_ROUND_KEY)!),
    );

    const newUser = await this.usersSevice.createUser({
      ...dto,
      password: hash,
    });

    return await this.loginUser(newUser);
  }

  async logout(userId: number) {
    await this.redisClient.del(`refresh_token_${userId}`);

    return {
      message: '로그아웃 되었습니다.',
    };
  }
}
