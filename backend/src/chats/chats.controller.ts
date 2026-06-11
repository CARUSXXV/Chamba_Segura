import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('chats')
@UseGuards(AuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  // GET /api/v1/chats
  @Get()
  async getMyChats(@Request() req: any) {
    // req.user viene del AuthGuard (el token desencriptado)
    return this.chatsService.getUserChats(req.user.id);
  }

  // POST /api/v1/chats
  @Post()
  async createChat(@Body() body: { cliente_id: string; trabajador_id: string; trabajo_id: string }) {
    return this.chatsService.createOrGetChat(body.cliente_id, body.trabajador_id, body.trabajo_id);
  }
}