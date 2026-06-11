import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MensajesService } from './mensajes.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('mensajes')
@UseGuards(AuthGuard)
export class MensajesController {
  constructor(private readonly mensajesService: MensajesService) {}

  // GET /api/v1/mensajes/:chatId
  @Get(':chatId')
  async getChatHistory(@Param('chatId') chatId: string) {
    return this.mensajesService.getMessagesByChat(chatId);
  }
}