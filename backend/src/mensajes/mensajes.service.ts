import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class MensajesService {
  constructor(private readonly supabase: SupabaseService) {}

  private get client() {
    return this.supabase.getClient();
  }

  async getMessagesByChat(chatId: string) {
    const { data, error } = await this.client
      .from('mensajes')
      .select(
        '*, emisor:perfiles!mensajes_emisor_id_fkey(nombre_completo, username)',
      )
      .eq('chat_id', chatId)
      .order('enviado_el', { ascending: true });

    if (error) {
      throw new InternalServerErrorException(
        error.message || 'Error cargando el historial de mensajes',
      );
    }
    return data;
  }

  async saveMessage(payload: {
    chat_id: string;
    emisor_id: string;
    contenido: string;
  }) {
    const { data, error } = await this.client
      .from('mensajes')
      .insert({
        id: crypto.randomUUID(),
        chat_id: payload.chat_id,
        emisor_id: payload.emisor_id,
        contenido: payload.contenido,
      } as never)
      .select(
        '*, emisor:perfiles!mensajes_emisor_id_fkey(nombre_completo, username)',
      )
      .single();

    if (error) {
      throw new InternalServerErrorException(
        error.message || 'Error guardando el mensaje',
      );
    }
    return data;
  }

  async editMessage(id: string, emisor_id: string, nuevo_contenido: string) {
    const { data, error } = await this.client
      .from('mensajes')
      .update({ contenido: nuevo_contenido } as never)
      .eq('id', id)
      .eq('emisor_id', emisor_id)
      .select(
        '*, emisor:perfiles!mensajes_emisor_id_fkey(nombre_completo, username)',
      )
      .single();

    if (error)
      throw new InternalServerErrorException(
        `Error editando mensaje: ${error.message}`,
      );
    return data;
  }

  async deleteMessage(id: string, emisor_id: string) {
    const { error } = await this.client
      .from('mensajes')
      .delete()
      .eq('id', id)
      .eq('emisor_id', emisor_id);

    if (error)
      throw new InternalServerErrorException(
        `Error eliminando mensaje: ${error.message}`,
      );
    return { id };
  }

  async isUserChatParticipant(
    userId: string,
    chatId: string,
  ): Promise<boolean> {
    const { data, error } = await this.client
      .from('chats')
      .select('id')
      .eq('id', chatId)
      .or(`cliente_id.eq.${userId},trabajador_id.eq.${userId}`)
      .maybeSingle();

    if (error)
      throw new InternalServerErrorException(
        `Error verificando acceso al chat: ${error.message}`,
      );
    return !!data;
  }
}
