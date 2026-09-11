import { IsEnum } from 'class-validator';
import { ReservationStatusEnum } from '../const/status.enum.const';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReservationStatusDto {
  @ApiProperty({
    description: '변경할 예약 상태',
    enum: ReservationStatusEnum,
    example: ReservationStatusEnum.CONFIRMED,
  })
  @IsEnum(ReservationStatusEnum)
  status!: ReservationStatusEnum;
}
