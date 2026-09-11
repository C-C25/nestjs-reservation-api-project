import {
  Body,
  Controller,
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
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @ApiOperation({ summary: '예약 목록 조회' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  getReservation(@Query() query: ReservationPaginateDto, @Req() req) {
    return this.reservationsService.reservationPaginate(query, req.user);
  }

  @Post(':spaceId')
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({ summary: '에약 생성' })
  @ApiResponse({ status: 201, description: '예약 생성 성공' })
  @ApiResponse({ status: 400, description: '이미 예약된 시간대입니다.' })
  @ApiResponse({ status: 404, description: '존재하지 않는 공간입니다.' })
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
  @ApiOperation({ summary: '예약 수정' })
  @ApiResponse({ status: 200, description: '수정 완료' })
  @ApiResponse({
    status: 400,
    description: '완료된 예약은 상태를 변경할 수 없습니다.',
  })
  @ApiResponse({ status: 404, description: '예약된 이벤트가 없습니다.' })
  @ApiResponse({
    status: 409,
    description:
      '다른 관리자가 이미 이 예약을 처리 했습니다. 다시 확인해주세요.',
  })
  patchReservation(
    @Param('reservationId', ParseIntPipe) id: number,
    @Body() dto: UpdateReservationStatusDto,
    @QueryRunner() qr: QR,
  ) {
    return this.reservationsService.updateStatusReservation(id, dto, qr);
  }
}
