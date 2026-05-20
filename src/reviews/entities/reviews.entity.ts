import { Column, Entity, ManyToOne } from "typeorm";
import { CoreEntity } from "../../common/entities/core.entity";
import { UsersEntity } from "../../users/entities/users.entity";
import { SpacesEntity } from "../../spaces/entities/spaces.entity";

@Entity("reviews")
export class ReviewsEntity extends CoreEntity {
    @ManyToOne(() => UsersEntity, (user) => user.reviews)
    user!: UsersEntity;

    @ManyToOne(() => SpacesEntity, (space) => space.reviews)
    space!: SpacesEntity;

    @Column({
        type: "text",
    })
    content!: string;

    @Column({
        type: "int"
    })
    rating!: number;
}