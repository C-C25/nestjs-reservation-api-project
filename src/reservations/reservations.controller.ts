import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create_reservation.dto';
import { UpdateReservationStatusDto } from './dto/update_reservation.status.dto';
import type { QueryRunner as QR } from 'typeorm';
import { QueryRunner } from '../common/decorator/query-runner.decorator';
import { ReservationPaginateDto } from './dto/paginate_reservation.dto';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  getReservation(@Query() query: ReservationPaginateDto, @Req() req) {
    return this.reservationsService.reservationPaginate(query, req.user);
  }

  @Post(':spaceId')
  @UseInterceptors(TransactionInterceptor)
  async postReservations(
    @Param('spaceId', ParseIntPipe) spaceId: number,
    @Body() dto: CreateReservationDto,
    @Request() req,
    @QueryRunner() qr: QR,
  ) {
    return await this.reservationsService.createReservation(
      req.user.id,
      spaceId,
      dto,
      qr,
    );
  }

  @Patch(':reservationId')
  @UseInterceptors(TransactionInterceptor)
  patchReservation(
    @Param('reservationId', ParseIntPipe) id: number,
    @Body() dto: UpdateReservationStatusDto,
    @QueryRunner() qr: QR,
  ) {
    return this.reservationsService.updateStatusReservation(id, dto, qr);
  }
}
