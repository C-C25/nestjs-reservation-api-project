import { Controller, Get, Query, Req } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatPaginateDto } from './dto/paginate.chats.dto';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  getPaginate(@Query() query: ChatPaginateDto, @Req() req) {
    return this.chatsService.chatPaginate(query, req.user);
  }
}
