import { Controller, Get, Query, Req } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatPageinateDto } from './dto/paginate.chats.dto';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  getPaginate(@Query() query: ChatPageinateDto, @Req() req) {
    return this.chatsService.chatPageinate(query, req.user);
  }
}
