import { IsNumber } from 'class-validator';

export class JoinRoomDto {
  @IsNumber({}, { each: true })
  chatId!: number;
}
