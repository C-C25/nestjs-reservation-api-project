import { Column, Entity, OneToMany } from "typeorm";
import { CoreEntity } from "../../common/entities/core.entity";
import { RoleEnum } from "../const/roles.enum.const";
import { SpacesEntity } from "../../spaces/entities/spaces.entity";
import { ReservationsEntity } from "../../reservations/entities/reservations.entity";
import { MessagesEntity } from "../../messages/entities/messages.entity";
import { ReviewsEntity } from "../../reviews/entities/reviews.entity";

@Entity("user")
export class UsersEntity extends CoreEntity {
    @Column({
        unique: true,
        nullable: false,
    })
    email!: string;

    @Column({
        select: false,
    })
    password!: string;

    @Column({
        unique: true,
        nullable: false, //정책에 따라 null가능 여부도 생각 해야 한다.
    })
    nickname!: string;

    @Column({
        type: "enum",
        enum: RoleEnum,
        default: RoleEnum.USER
    })
    role!: RoleEnum;

    @OneToMany(() => SpacesEntity, (space) => space.owner)
    spaces!: SpacesEntity[];

    @OneToMany(() => ReservationsEntity, (reservation) => reservation.user)
    reservations!: ReservationsEntity[];

    @OneToMany(() => MessagesEntity, (messages) => messages.sender)
    messages!: MessagesEntity[];

    @OneToMany(() => ReviewsEntity, (reviews) => reviews.user)
    reviews!: ReviewsEntity[];
}