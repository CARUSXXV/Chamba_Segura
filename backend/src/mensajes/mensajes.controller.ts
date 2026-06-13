import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { MensajesService } from './mensajes.service';
import { AuthGuard } from '../auth/auth.guard';
import type { Request } from 'express';
import type { User } from '@supabase/supabase-js';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('mensajes')
@UseGuards(AuthGuard)
export class MensajesController {
  constructor(private readonly mensajesService: MensajesService) {}

  @Get(':chatId')
  async getChatHistory(
    @Req() req: RequestWithUser,
    @Param('chatId') chatId: string,
  ) {
    const isParticipant = await this.mensajesService.isUserChatParticipant(
      req.user.id,
      chatId,
    );
    if (!isParticipant) {
      throw new ForbiddenException('No tienes acceso a este chat');
    }
    return this.mensajesService.getMessagesByChat(chatId);
  }
}
