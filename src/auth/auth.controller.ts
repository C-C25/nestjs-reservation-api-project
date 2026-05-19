import { Body, Controller, HttpCode, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BasicTokenGuard } from './guard/basic_token.guard';
import { RegisterAuthDto } from './dto/auth_register.dto';
import { IsPublic } from '../common/decorator/is_public.decoreator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

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