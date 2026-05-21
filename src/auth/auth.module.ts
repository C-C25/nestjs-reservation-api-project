import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import {
  AccessTokenGuard,
  BearerTokenGuard,
  RefreshTokenGuard,
} from './guard/bearer_token.guard';
import { BasicTokenGuard } from './guard/basic_token.guard';

@Module({
  imports: [JwtModule.register({}), UsersModule],
  exports: [AuthService],
  controllers: [AuthController],
  providers: [
    AuthService,
    BearerTokenGuard,
    BasicTokenGuard,
    AccessTokenGuard,
    RefreshTokenGuard,
  ],
})
export class AuthModule {}
