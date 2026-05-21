import {
  BadRequestException,
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

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersSevice: UsersService,
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

  rotateAccessToken(token: string) {
    const decoded = this.jwtService.verify(token, {
      secret: this.configService.get<string>(ENV_JWT_REFRESH_SECRET_KEY),
    });

    if (decoded.tokenType !== 'refresh') {
      throw new UnauthorizedException(
        'accessToken은 refreshToken으로 발급 가능',
      );
    }

    return this.accessSignToken({
      ...decoded,
    });
  }

  rotateRefreshToken(token: string) {
    const decoded = this.jwtService.verify(token, {
      secret: this.configService.get<string>(ENV_JWT_REFRESH_SECRET_KEY),
    });

    if (decoded.tokenType !== 'refresh') {
      throw new UnauthorizedException(
        'refreshToken은 refreshToken으로만 발급 가능합니다.',
      );
    }

    return this.refreshSignToken({
      ...decoded,
    });
  }

  private accessSignToken(user: Pick<UsersEntity, 'email' | 'id'>) {
    const accessPayload = {
      sub: user.id,
      email: user.email,
      tokenType: 'access',
    };

    return this.jwtService.sign(accessPayload, {
      secret: this.configService.get<string>(ENV_JWT_ACCESS_SECRET_KEY),
      expiresIn: '24h',
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
      expiresIn: '10d',
    });
  }

  loginUser(user: Pick<UsersEntity, 'email' | 'id'>) {
    return {
      accessToken: this.accessSignToken(user),
      refreshToken: this.refreshSignToken(user),
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

    return this.loginUser(existingUser);
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

    return this.loginUser(newUser);
  }
}
