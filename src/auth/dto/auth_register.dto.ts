import { IsEmail, IsString, Length } from "class-validator";
import { stringValidationMessage } from "../../common/validation_message/stirng_validation.message.const";
import { lengthValidationMessage } from "../../common/validation_message/number_validation.message.const";

export class RegisterAuthDto {
    @IsEmail({}, {
        message: `올바른 이메일 형식이 아닙니다.`
    })
    email!: string;

    @IsString({
        message: stringValidationMessage,
    })
    @Length(2, 8, {
        message: lengthValidationMessage,
    })
    nickname!: string;

    @IsString({
        message: stringValidationMessage,
    })
    @Length(3, 8, {
        message: lengthValidationMessage,
    }) // 임시
    password!: string;
}