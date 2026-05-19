import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { CoreEntity } from "../../common/entities/core.entity";
import { ReservationsEntity } from "../../reservations/entities/reservations.entity";
import { MessagesEntity } from "../../messages/entities/messages.entity";

@Entity("chat")
export class ChatsEntity extends CoreEntity {
    @Column({
        default: true,
    })
    isActive!: boolean

    @OneToOne(() => ReservationsEntity, (reservation) => reservation.chat, { nullable: false })
    @JoinColumn() // OneToOne = JoinColumn(), ManyToMany = JoinTable()
    reservation!: ReservationsEntity;

    @OneToMany(() => MessagesEntity, (message) => message.chat)
    messages!: MessagesEntity[];
}