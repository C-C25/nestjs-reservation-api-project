import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Between, LessThan, MoreThan, QueryRunner, Repository } from 'typeorm';
import { ReservationsEntity } from './entities/reservations.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateReservationDto } from './dto/create_reservation.dto';
import { SpacesService } from '../spaces/spaces.service';
import { UpdateReservationStatusDto } from './dto/update_reservation.status.dto';
import { ReservationStatusEnum } from './const/status.enum.const';
import { ChatsService } from '../chats/chats.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommonService } from '../common/common.service';
import { ReservationPaginateDto } from './dto/paginate_reservation.dto';
import { UsersEntity } from '../users/entities/users.entity';
import { RoleEnum } from '../users/const/roles.enum.const';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(ReservationsEntity)
    private readonly reservationRepo: Repository<ReservationsEntity>,
    private readonly spacesService: SpacesService,
    private readonly chatsService: ChatsService,
    private readonly commonService: CommonService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async hendleReservationReminder() {
    const now = new Date();

    const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000);

    const twentyNineMinutesLater = new Date(now.getTime() + 29 * 60 * 1000);

    const reservations = await this.reservationRepo.find({
      where: {
        startTime: Between(twentyNineMinutesLater, thirtyMinutesLater),
        status: ReservationStatusEnum.CONFIRMED,
      },
    });

    for (const reservation of reservations) {
      console.log(
        `[e.g. 무슨회사] 에약 ID: ${reservation.id} - 예약 하신 [e.g. 헬스장1번] 입장 까지 30분 남았습니다. 예약 취소는 불가능 합니다.`,
      );
    }
  }

  reservationPaginate(dto: ReservationPaginateDto, user: UsersEntity) {
    const ovrrideOptions =
      user.role === RoleEnum.ADMIN
        ? { relations: { user: true, space: true } }
        : {
            where: {
              user: { id: user.id },
            },
            relation: { user: true, space: true },
          };

    return this.commonService.pagiante(
      dto,
      this.reservationRepo,
      ovrrideOptions,
      'reservation',
    );
  }

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<ReservationsEntity>(ReservationsEntity)
      : this.reservationRepo;
  }

  async createReservation(
    userId: number,
    spaceId: number,
    dto: CreateReservationDto,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    await this.spacesService.findOneSpaces(spaceId);

    const overlapping = await repository.findOne({
      where: {
        space: { id: spaceId },
        startTime: LessThan(dto.endTime),
        endTime: MoreThan(dto.startTime),
      },
      lock: { mode: 'pessimistic_write' },
    });

    if (overlapping) {
      throw new BadRequestException('이미 예약된 시간대 입니다.');
    }

    const reservations = repository.create({
      ...dto,
      user: { id: userId },
      space: { id: spaceId },
    });

    const newReservation = await repository.save(reservations);

    return newReservation;
  }

  async updateStatusReservation(
    reservationId: number,
    dto: UpdateReservationStatusDto,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const reservation = await repository.findOne({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('예약된 이벤트가 없습니다.');
    }

    if (reservation.status === ReservationStatusEnum.COMPLETED) {
      throw new BadRequestException('완료된 예약은 상태를 변경할 수 없습니다.');
    }

    reservation.status = dto.status;

    const newReservation = await repository.save(reservation);

    if (reservation.status === ReservationStatusEnum.CONFIRMED) {
      await this.chatsService.createChatRoom(reservationId);
    }

    return newReservation;
  }
}
