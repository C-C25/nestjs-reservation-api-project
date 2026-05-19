import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create_reservation.dto';
import { UpdateReservationStatusDto } from './dto/update_reservation.status.dto';
import { RoleGuard } from '../users/guard/role.guard';
import { IsPublic } from '../common/decorator/is_public.decoreator';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) { }

  @Get()
  @IsPublic()
  getReservartion() {
    return this.reservationsService.findReservation();
  }

  @Post(":spaceId")
  postReservations(
    @Param("spaceId", ParseIntPipe) spaceId: number,
    @Body() dto: CreateReservationDto,
    @Request() req,
  ) {
    return this.reservationsService.createReservation(req.user.id, spaceId, dto);
  }

  @Patch(":reservationId")
  patchReservation(
    @Param("reservationId", ParseIntPipe) id: number,
    @Body() dto: UpdateReservationStatusDto,
  ) {
    return this.reservationsService.updateStatusReservation(id, dto)
  }
}
