import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ReservationsEntity } from './entities/reservations.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateReservationDto } from './dto/create_reservation.dto';
import { SpacesService } from '../spaces/spaces.service';
import { UpdateReservationStatusDto } from './dto/update_reservation.status.dto';
import { ReservationStatusEnum } from './const/status.enum.const';

@Injectable()
export class ReservationsService {
    constructor(
        @InjectRepository(ReservationsEntity)
        private readonly reservationRepo: Repository<ReservationsEntity>,
        private readonly spacesService: SpacesService,
    ) { }

    async findReservation(){
        return this.reservationRepo.find();
    }
    

    async createReservation(userId: number, spaceId: number, dto: CreateReservationDto) {
        await this.spacesService.findOneSpaces(spaceId);

        const reservations = this.reservationRepo.create({
            ...dto,
            user: { id: userId },
            space: { id: spaceId },
        });

        const newReservation = await this.reservationRepo.save(reservations);

        return newReservation;
    }


    async updateStatusReservation(reservationId: number, dto: UpdateReservationStatusDto) {
        const reservation = await this.reservationRepo.findOne({
            where: { id: reservationId },
        });

        if (!reservation) {
            throw new NotFoundException("예약된 이벤트가 없습니다.");
        }

        if (reservation.status === ReservationStatusEnum.COMPLETED) {
            throw new BadRequestException("확정된 예약은 취소 변경 시간 추가를 이용 할수 없습니다.");
        }

        reservation.status = dto.status;

        const newReservation = await this.reservationRepo.save(reservation);

        return newReservation;
    }
}
