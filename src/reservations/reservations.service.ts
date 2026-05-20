import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { ReservationsEntity } from './entities/reservations.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateReservationDto } from './dto/create_reservation.dto';
import { SpacesService } from '../spaces/spaces.service';
import { UpdateReservationStatusDto } from './dto/update_reservation.status.dto';
import { ReservationStatusEnum } from './const/status.enum.const';
import { ChatsService } from '../chats/chats.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ReservationsService {
    constructor(
        @InjectRepository(ReservationsEntity)
        private readonly reservationRepo: Repository<ReservationsEntity>,
        private readonly spacesService: SpacesService,
        private readonly chatsService: ChatsService,
    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async hendleReservationReminder() {
        console.log('스케줄러 실행됨')

        // 현재 시간을 뽑아 온다.
        const now = new Date();

        // 30분 내에 존재 하는 데이터를 조회 한다 현재 시간에 ms 으로 계산 한다.
        const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000);

        // 29분 내에 존재 하는 데이터를 조회 한다 현재 시간에 ms 으로 계산 한다.
        const twentyNineMinutesLater = new Date(now.getTime() + 29 * 60 * 1000);

        // 찾는 조건이 CONFIRMED 이면서 시작하는 예약 을 조건으로 찾는다.
        const reservations = await this.reservationRepo.find({
            where: {
                startTime: Between(twentyNineMinutesLater, thirtyMinutesLater),
                status: ReservationStatusEnum.CONFIRMED,
            }
        });

        for (const reservation of reservations) {
            console.log(`[e.g. 무슨회사] 에약 ID: ${reservation.id} - 예약 하신 [e.g. 헬스장1번] 입장 까지 30분 남았습니다. 예약 취소는 불가능 합니다.`)
        }
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
            throw new BadRequestException("완료된 예약은 상태를 변경할 수 없습니다.");
        }

        reservation.status = dto.status;

        const newReservation = await this.reservationRepo.save(reservation);

        if (reservation.status === ReservationStatusEnum.CONFIRMED) {
            await this.chatsService.createChatRoom(reservationId);
        }

        return newReservation;
    }
}
