import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessagesEntity } from './entities/messages.entity';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(MessagesEntity)
    private readonly messageRepo: Repository<MessagesEntity>,
  ) {}

  async createMessage(dto: CreateMessageDto, authorId: number) {
    const message = await this.messageRepo.save({
      chat: {
        id: dto.chatId,
      },
      sender: {
        id: authorId,
      },
      content: dto.content,
    });

    return await this.messageRepo.findOne({
      where: {
        id: message.id,
      },
      relations: {
        chat: true,
      },
    });
  }
}
