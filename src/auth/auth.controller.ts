import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { BasicTokenGuard } from './guard/basic_token.guard';
import { RegisterAuthDto } from './dto/auth_register.dto';
import { IsPublic } from '../common/decorator/is_public.decoreator';
import { RefreshTokenGuard } from './guard/bearer_token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token/access')
  @IsPublic()
  @UseGuards(RefreshTokenGuard)
  async postTokenAccess(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    const newToken = await this.authService.rotateAccessToken(token);

    return {
      accessToken: newToken,
    };
  }

  @Post('token/refresh')
  @IsPublic()
  @UseGuards(RefreshTokenGuard)
  async postTokenRefresh(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    const newToken = await this.authService.rotateRefreshToken(token);

    return {
      refreshToken: newToken,
    };
  }

  @IsPublic()
  @Post('register/email')
  registerPost(@Body() dto: RegisterAuthDto) {
    return this.authService.registerWithEmail(dto);
  }

  @IsPublic()
  @Post('login/email')
  @UseGuards(BasicTokenGuard)
  @HttpCode(200)
  loginPost(@Request() req) {
    return this.authService.loginUser(req.user);
  }

  @Post('logout/email')
  async logout(@Request() req) {
    console.log(`logout userId:`, req.user);
    return this.authService.logout(req.user.id);
  }
}
