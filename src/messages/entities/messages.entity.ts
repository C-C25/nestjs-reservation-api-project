import { Column, Entity, ManyToOne } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { ChatsEntity } from '../../chats/entities/chats.entity';

@Entity('message')
export class MessagesEntity extends CoreEntity {
  @Column({
    type: 'text',
  })
  content!: string;

  @ManyToOne(() => UsersEntity, (user) => user.messages, {
    nullable: false,
  })
  sender!: UsersEntity;

  @ManyToOne(() => ChatsEntity, (chat) => chat.messages, {
    nullable: false,
  })
  chat!: ChatsEntity;
}
