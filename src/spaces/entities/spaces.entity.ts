import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { CoreEntity } from "../../common/entities/core.entity";
import { UsersEntity } from "../../users/entities/users.entity";
import { ReservationsEntity } from "../../reservations/entities/reservations.entity";

@Entity("space")
export class SpacesEntity extends CoreEntity {
    @Column({
        type: "varchar",
        length: 20
    })
    title!: string;

    @Column({
        type: "text",
    })
    content!: string;

    @Column({
        type: "text",
    })
    address!: string;

    @Column({
        type: "varchar",
        length: 13
    })
    contact!: string;

    @Column({
        type: "int"
    })
    pricePerHour: number = 0;

    @Column({
        type: "int"
    })
    maxCapacity: number = 1;

    @Column({
        type: "simple-array",
        nullable: true,
    })
    imageUrl?: string[];

    @ManyToOne(() => UsersEntity, (user) => user.spaces, {
        nullable: false,
    })
    owner!: UsersEntity;

    @OneToMany(() => ReservationsEntity, (reservations) => reservations.space)
    reservations!: ReservationsEntity[];
}
