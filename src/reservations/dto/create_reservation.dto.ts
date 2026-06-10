import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { stringValidationMessage } from '../../common/validation_message/stirng_validation.message.const';
import { VersionColumn } from 'typeorm';

export class CreateReservationDto {
  @IsDate()
  @Type(() => Date)
  startTime!: Date;

  @IsDate()
  @Type(() => Date)
  endTime!: Date;

  @IsString({
    message: stringValidationMessage,
  })
  content!: string;

  @IsNumber()
  @IsOptional()
  version?: number;
}
