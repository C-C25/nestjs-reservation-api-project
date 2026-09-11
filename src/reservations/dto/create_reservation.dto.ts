import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { stringValidationMessage } from '../../common/validation_message/string_validation.message.const';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({
    description: '예약 시작 시간',
    example: '2026-10-01T10:00:00Z',
  })
  @IsDate()
  @Type(() => Date)
  startTime!: Date;

  @ApiProperty({
    description: '예약 종료 시간',
    example: '2026-10-01T11:00:00Z',
  })
  @IsDate()
  @Type(() => Date)
  endTime!: Date;

  @ApiProperty({
    description: '예약 관련 메모/내용',
    example: '스터디 모집',
  })
  @IsString({
    message: stringValidationMessage,
  })
  content!: string;
}
