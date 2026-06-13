import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ChatsService {
  constructor(private readonly supabase: SupabaseService) { }

  private get client() {
    return this.supabase.getClient();
  }

  async getUserChats(userId: string) {
    const { data, error } = await this.client
      .from('chats')
      .select(
        `
        *,
        cliente:perfiles!chats_cliente_id_fkey(nombre_completo, username, foto_url),
        trabajador:perfiles!chats_trabajador_id_fkey(nombre_completo, username, foto_url)
      `,
      )
      .or(`cliente_id.eq.${userId},trabajador_id.eq.${userId}`)
      .order('creado_el', { ascending: false });

    if (error)
      throw new InternalServerErrorException(
        `Error al obtener chats: ${error.message}`,
      );
    return data;
  }

  async createChat(cliente_id: string, trabajador_id: string, job_id: string) {
    const { data: existingChat } = await this.client
      .from('chats')
      .select('*')
      .eq('job_id', job_id)
      .eq('cliente_id', cliente_id)
      .eq('trabajador_id', trabajador_id)
      .maybeSingle();

    if (existingChat) return existingChat;

    const { data: newChat, error } = await this.client
      .from('chats')
      .insert({
        id: crypto.randomUUID(),
        cliente_id,
        trabajador_id,
        job_id,
      } as never)
      .select()
      .single();

    if (error)
      throw new InternalServerErrorException(
        `Error al crear chat: ${error.message}`,
      );
    return newChat;
  }

  async findChatById(chatId: string) {
    const { data, error } = await this.client
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .maybeSingle();

    if (error)
      throw new InternalServerErrorException(
        `Error al buscar chat: ${error.message}`,
      );
    return data;
  }
}
