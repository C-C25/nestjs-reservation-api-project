import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsEntity } from './entities/reservations.entity';
import { UsersModule } from '../users/users.module';
import { SpacesModule } from '../spaces/spaces.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReservationsEntity]),
    UsersModule,
    SpacesModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule { }
