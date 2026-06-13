import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { AuthGuard } from '../auth/auth.guard';
import type { Request } from 'express';
import type { User } from '@supabase/supabase-js';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('chats')
@UseGuards(AuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  async getMyChats(@Req() req: RequestWithUser) {
    return this.chatsService.getUserChats(req.user.id);
  }

  @Post()
  async createChat(
    @Req() req: RequestWithUser,
    @Body() body: { cliente_id: string; trabajador_id: string; job_id: string },
  ) {
    const userId = req.user.id;
    if (userId !== body.cliente_id && userId !== body.trabajador_id) {
      throw new BadRequestException('Debes ser parte del chat para crearlo');
    }
    return this.chatsService.createChat(
      body.cliente_id,
      body.trabajador_id,
      body.job_id,
    );
  }
}
