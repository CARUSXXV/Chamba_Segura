import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MensajesService } from './mensajes.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class MensajesGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly mensajesService: MensajesService) {}

  @SubscribeMessage('joinChat')
  handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    client.join(chatId);
    console.log(`Cliente unió al chat: ${chatId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chat_id: string; emisor_id: string; contenido: string },
  ) {
    try {
      const savedMessage = await this.mensajesService.saveMessage(payload);
      // Emite el mensaje a la sala (incluyendo a quien lo envió)
      this.server.to(payload.chat_id).emit('newMessage', savedMessage);
    } catch (error) {
      client.emit('error', { message: 'No se pudo guardar el mensaje en la base de datos' });
    }
  }

  // Evento: Editar mensaje
  @SubscribeMessage('editMessage')
  async handleEditMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { id: string; chat_id: string; emisor_id: string; contenido: string },
  ) {
    try {
      const updatedMessage = await this.mensajesService.editMessage(payload.id, payload.emisor_id, payload.contenido);
      // Avisamos a toda la sala que un mensaje cambió
      this.server.to(payload.chat_id).emit('messageEdited', updatedMessage);
    } catch (error) {
      client.emit('error', { message: 'No se pudo editar el mensaje' });
    }
  }

  // Evento: Eliminar mensaje
  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { id: string; chat_id: string; emisor_id: string },
  ) {
    try {
      await this.mensajesService.deleteMessage(payload.id, payload.emisor_id);
      // Avisamos a toda la sala que quiten ese mensaje de la vista
      this.server.to(payload.chat_id).emit('messageDeleted', { id: payload.id });
    } catch (error) {
      client.emit('error', { message: 'No se pudo eliminar el mensaje' });
    }
  }
}