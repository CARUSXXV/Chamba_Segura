import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';



@Injectable()
export class MensajesService {
  constructor(private readonly supabase: SupabaseService) {}

  // Obtener el historial completo de un chat específico
  async getMessagesByChat(chatId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('mensajes')
      .select('*, sender:perfiles(nombre_completo, username)')
      .eq('chat_id', chatId)
      .order('creado_el', { ascending: true }); // Orden cronológico para el chat

    if (error) throw new InternalServerErrorException('Error cargando el historial de mensajes');
    return data;
  }

  // Guardar un mensaje en la base de datos (Llamado por el WebSocket)
  async saveMessage(payload: { chat_id: string; emisor_id: string; contenido: string }) {
    const { data, error } = await this.supabase.getClient()
      .from('mensajes')
      .insert([payload] as any)
      .select('*, sender:perfiles(nombre_completo, username)')
      .single();

    if (error) throw new InternalServerErrorException('Error guardando el mensaje');
    return data;
  }

  async editMessage(id: string, emisor_id: string, nuevo_contenido: string) {
    const { data, error } = await this.supabase.getClient()
      .from('mensajes')
      // Actualizamos el contenido y podríamos tener un campo booleano 'editado'
      .update({ contenido: nuevo_contenido } as never)
      .eq('id', id)
      .eq('emisor_id', emisor_id) // Seguridad: Solo el dueño puede editarlo
      .select('*, emisor:perfiles(nombre_completo, username)')
      .single();

    if (error) throw new InternalServerErrorException(`Error editando mensaje: ${error.message}`);
    return data;
  }

  // Eliminar un mensaje
  async deleteMessage(id: string, emisor_id: string) {
    const { error } = await this.supabase.getClient()
      .from('mensajes')
      .delete()
      .eq('id', id)
      .eq('emisor_id', emisor_id); // Seguridad: Solo el dueño puede borrarlo

    if (error) throw new InternalServerErrorException(`Error eliminando mensaje: ${error.message}`);
    return { id }; // Devolvemos el ID para que el frontend sepa cuál quitar de la pantalla
  }
}