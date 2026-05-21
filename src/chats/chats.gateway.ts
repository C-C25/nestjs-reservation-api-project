import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { ChatsService } from './chats.service';
import { Server, Socket } from 'socket.io';
import { UsersEntity } from '../users/entities/users.entity';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import { MessagesService } from '../messages/messages.service';
import { JoinRoomDto } from './dto/join_room.dto';

@WebSocketGateway({
  namespace: 'chats',
})
export class ChatsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly messagesService: MessagesService,
  ) {}

  @WebSocketServer()
  server!: Server;

  afterInit(server: any) {
    console.log(`서버 연결 됨`);
  }

  async handleDisconnect(socket: Socket) {
    console.log(`on disconnect called : ${socket.id}`);
  }

  async handleConnection(socket: Socket & { user: UsersEntity }) {
    console.log(`on connect called: ${socket.id}`);

    const heades = socket.handshake.headers;

    const rawToken = heades.authorization!;

    if (!rawToken) {
      // 토큰이 없다면 연결을 끊는다.
      socket.disconnect();
    }

    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true);

      const payload = this.authService.accessVerifyToken(token);

      const user = await this.usersService.findByEmail(payload.email);

      if (!user) {
        socket.disconnect();
        return;
      }

      socket.user = user;
      return true;
    } catch (e) {
      socket.disconnect();
    }
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @SubscribeMessage('join_room')
  async joinRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() socket: Socket & { user: UsersEntity },
  ) {
    socket.join(data.chatId.toString());
  }

  @SubscribeMessage('send_message')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async sendMessage(
    @MessageBody() data: CreateMessageDto,
    @ConnectedSocket() socket: Socket & { user: UsersEntity },
  ) {
    const message = await this.messagesService.createMessage(
      data,
      socket.user.id,
    );

    if (!message) {
      throw new WsException('메세지 전송중 문제가 생겼습니다.');
    }

    socket.to(message.chat.id.toString()).emit('receive_message', message);
  }
}
