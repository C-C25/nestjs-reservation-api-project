import { IsInt, IsString, Max, Min } from 'class-validator';
import { stringValidationMessage } from '../../common/validation_message/stirng_validation.message.const';

export class CreateReviewDto {
  @IsString({
    message: stringValidationMessage,
  })
  content!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;
}
