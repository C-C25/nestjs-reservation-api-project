import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatsEntity } from './entities/chats.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatsService {
    constructor(
        @InjectRepository(ChatsEntity)
        private readonly chatsRepo: Repository<ChatsEntity>,
    ) { }

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
            where: { id: chat.id }
        });
    }
}
