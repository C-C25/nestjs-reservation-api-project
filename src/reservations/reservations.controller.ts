import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create_reservation.dto';
import { UpdateReservationStatusDto } from './dto/update_reservation.status.dto';
import { TarnsactionIntercetor } from '../common/interceptor/transaction.intercerptor';
import type { QueryRunner as QR } from 'typeorm';
import { QueryRunner } from '../common/decorator/query-runner.decorator';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) { }

  @Post(":spaceId")
  @UseInterceptors(TarnsactionIntercetor)
  async postReservations(
    @Param("spaceId", ParseIntPipe) spaceId: number,
    @Body() dto: CreateReservationDto,
    @Request() req,
    @QueryRunner() qr: QR
  ) {
    return await this.reservationsService.createReservation(req.user.id, spaceId, dto, qr);
  }

  @Patch(":reservationId")
  patchReservation(
    @Param("reservationId", ParseIntPipe) id: number,
    @Body() dto: UpdateReservationStatusDto,
  ) {
    return this.reservationsService.updateStatusReservation(id, dto)
  }
}
