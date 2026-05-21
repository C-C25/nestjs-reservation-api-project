import { Body, Controller, HttpCode, Post, Request, UseGuards, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BasicTokenGuard } from './guard/basic_token.guard';
import { RegisterAuthDto } from './dto/auth_register.dto';
import { IsPublic } from '../common/decorator/is_public.decoreator';
import { RefreshTokenGuard } from './guard/bearer_token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('token/access')
  @IsPublic()
  @UseGuards(RefreshTokenGuard)
  postTokenAccess(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    const newToken = this.authService.rotateAccessToken(token);

    return {
      accessToken: newToken
    }
  }

  @Post('token/refresh')
  @IsPublic()
  @UseGuards(RefreshTokenGuard)
  postTokenRefresh(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    const newToken = this.authService.rotateRefreshToken(token);

    return {
      refreshToken: newToken
    }
  }

  @IsPublic()
  @Post("register/email")
  registerPost(
    @Body() dto: RegisterAuthDto
  ) {
    return this.authService.registerWithEmail(dto)
  }

  @IsPublic()
  @Post("login/email")
  @UseGuards(BasicTokenGuard)
  @HttpCode(200)
  loginPost(@Request() req,) {
    return this.authService.loginUser(req.user);
  }
} 