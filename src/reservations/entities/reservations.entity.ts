import { Column, Entity, ManyToOne, OneToOne, VersionColumn } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { ReservationStatusEnum } from '../const/status.enum.const';
import { UsersEntity } from '../../users/entities/users.entity';
import { SpacesEntity } from '../../spaces/entities/spaces.entity';
import { ChatsEntity } from '../../chats/entities/chats.entity';

@Entity('reservation')
export class ReservationsEntity extends CoreEntity {
  @Column({
    type: 'timestamp',
  })
  startTime!: Date;

  @Column({
    type: 'timestamp',
  })
  endTime!: Date;

  @Column({
    type: 'text',
  })
  content!: string;

  @Column({
    type: 'enum',
    enum: ReservationStatusEnum,
    default: ReservationStatusEnum.PENDING,
  })
  status!: ReservationStatusEnum;

  @ManyToOne(() => UsersEntity, (user) => user.reservations, {
    nullable: false,
  })
  user!: UsersEntity;

  @ManyToOne(() => SpacesEntity, (spaces) => spaces.reservations, {
    nullable: false,
  })
  space!: SpacesEntity;

  @OneToOne(() => ChatsEntity, (chat) => chat.reservation)
  chat!: ChatsEntity;

  @VersionColumn()
  version!: number;
}
