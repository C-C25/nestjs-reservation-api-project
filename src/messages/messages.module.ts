import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesEntity } from './entities/messages.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessagesEntity])
  ],
  exports: [MessagesService],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule { }
