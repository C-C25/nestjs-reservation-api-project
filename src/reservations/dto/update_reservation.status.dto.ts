import { IsEnum } from 'class-validator';
import { ReservationStatusEnum } from '../const/status.enum.const';

export class UpdateReservationStatusDto {
  @IsEnum(ReservationStatusEnum)
  status!: ReservationStatusEnum;
}
