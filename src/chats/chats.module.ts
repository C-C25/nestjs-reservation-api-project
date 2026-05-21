import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsEntity } from './entities/chats.entity';
import { MessagesModule } from '../messages/messages.module';
import { ChatsGateway } from './chats.gateway';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatsEntity]),
    MessagesModule,
    AuthModule,
    UsersModule,
    CommonModule,
  ],
  exports: [ChatsService],
  controllers: [ChatsController],
  providers: [ChatsService, ChatsGateway],
})
export class ChatsModule {}
