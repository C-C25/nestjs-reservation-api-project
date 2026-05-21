import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatsEntity } from './entities/chats.entity';
import { Repository } from 'typeorm';
import { CommonService } from '../common/common.service';
import { ChatPageinateDto } from './dto/paginate.chats.dto';
import { UsersEntity } from '../users/entities/users.entity';
import { RoleEnum } from '../users/const/roles.enum.const';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatsEntity)
    private readonly chatsRepo: Repository<ChatsEntity>,
    private readonly commonService: CommonService,
  ) {}

  chatPageinate(dto: ChatPageinateDto, user: UsersEntity) {
    const ovrrideOptions =
      user.role === RoleEnum.ADMIN
        ? { relations: { reservation: true } }
        : {
            where: {
              reservation: { user: { id: user.id } },
            },
            relations: { reservation: true },
          };

    return this.commonService.pagiante(
      dto,
      this.chatsRepo,
      ovrrideOptions,
      'chats',
    );
  }

  async createChatRoom(reservationId: number) {
    const existingChat = await this.chatsRepo.findOne({
      where: {
        reservation: {
          id: reservationId,
        },
      },
    });

    if (existingChat) {
      return existingChat;
    }

    const chat = await this.chatsRepo.save({
      reservation: { id: reservationId },
      isActive: true,
    });

    return this.chatsRepo.findOne({
      where: { id: chat.id },
    });
  }
}
