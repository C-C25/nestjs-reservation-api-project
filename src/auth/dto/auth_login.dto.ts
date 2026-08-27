import { IsEmail, IsString, MaxLength } from 'class-validator';
import { stringValidationMessage } from '../../common/validation_message/string_validation.message.const';

export class LoginAuthDto {
  @IsEmail(
    {},
    {
      message: `올바른 이메일 형식이 아닙니다.`,
    },
  )
  email!: string;

  @IsString({
    message: stringValidationMessage,
  })
  @MaxLength(8, {
    message: `이메일 또는 비밀번호를 확인해주세요.`,
  })
  password!: string;
}
