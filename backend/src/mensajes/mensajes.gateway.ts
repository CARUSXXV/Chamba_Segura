import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MensajesService } from './mensajes.service';
import { SupabaseService } from '../supabase/supabase.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class MensajesGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly mensajesService: MensajesService,
    private readonly supabase: SupabaseService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) {
      client.emit('error', { message: 'Token de autenticación requerido' });
      client.disconnect();
      return;
    }

    const { data, error } = await this.supabase.getClient().auth.getUser(token);
    if (error || !data?.user) {
      client.emit('error', { message: 'Token inválido o expirado' });
      client.disconnect();
      return;
    }

    client.userId = data.user.id;
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() chatId: string,
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'No autenticado' });
      return;
    }
    try {
      const isParticipant = await this.mensajesService.isUserChatParticipant(
        client.userId,
        chatId,
      );
      if (!isParticipant) {
        client.emit('error', { message: 'No tienes acceso a este chat' });
        return;
      }
      await client.join(chatId);
    } catch {
      client.emit('error', { message: 'Error al unirse al chat' });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    payload: { chat_id: string; emisor_id: string; contenido: string },
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'No autenticado' });
      return;
    }
    if (client.userId !== payload.emisor_id) {
      client.emit('error', {
        message: 'No puedes enviar mensajes como otro usuario',
      });
      return;
    }
    const isParticipant = await this.mensajesService.isUserChatParticipant(
      client.userId,
      payload.chat_id,
    );
    if (!isParticipant) {
      client.emit('error', { message: 'No tienes acceso a este chat' });
      return;
    }
    try {
      const savedMessage = await this.mensajesService.saveMessage(payload);
      this.server.to(payload.chat_id).emit('newMessage', savedMessage);
      client.emit('messageSent', savedMessage);
    } catch {
      client.emit('error', {
        message: 'No se pudo guardar el mensaje en la base de datos',
      });
    }
  }

  @SubscribeMessage('editMessage')
  async handleEditMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    payload: {
      id: string;
      chat_id: string;
      emisor_id: string;
      contenido: string;
    },
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'No autenticado' });
      return;
    }
    if (client.userId !== payload.emisor_id) {
      client.emit('error', {
        message: 'No puedes editar mensajes de otro usuario',
      });
      return;
    }
    try {
      const updatedMessage = await this.mensajesService.editMessage(
        payload.id,
        payload.emisor_id,
        payload.contenido,
      );
      this.server.to(payload.chat_id).emit('messageEdited', updatedMessage);
    } catch {
      client.emit('error', { message: 'No se pudo editar el mensaje' });
    }
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { id: string; chat_id: string; emisor_id: string },
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'No autenticado' });
      return;
    }
    if (client.userId !== payload.emisor_id) {
      client.emit('error', {
        message: 'No puedes eliminar mensajes de otro usuario',
      });
      return;
    }
    try {
      await this.mensajesService.deleteMessage(payload.id, payload.emisor_id);
      this.server
        .to(payload.chat_id)
        .emit('messageDeleted', { id: payload.id });
    } catch {
      client.emit('error', { message: 'No se pudo eliminar el mensaje' });
    }
  }
}
