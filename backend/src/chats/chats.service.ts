import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Cron, CronExpression } from '@nestjs/schedule';


export interface Mensaje {
  id?: string;
  chat_id: string;
  sender_id: string;
  contenido: string;
  enviado_el?: string;
  creado_el?: string;
}

@Injectable()
export class ChatsService {
  constructor(private readonly supabase: SupabaseService) {}

  // 1. Obtener todos los chats de un usuario
  async getUserChats(userId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('chats')
      .select(`
        *,
        cliente:perfiles!chats_cliente_id_fkey(nombre_completo, username, foto_url),
        trabajador:perfiles!chats_trabajador_id_fkey(nombre_completo, username, foto_url)
      `)
      // Trae los chats donde el usuario sea el cliente O el trabajador
      .or(`cliente_id.eq.${userId},trabajador_id.eq.${userId}`)
      .order('creado_el', { ascending: false });

    if (error) throw new InternalServerErrorException(`Error al obtener chats: ${error.message}`);
    return data;
  }

  // 2. Iniciar un nuevo chat (o devolverlo si ya existe)
  async createOrGetChat(cliente_id: string, trabajador_id: string, trabajo_id: string) {
    const client = this.supabase.getClient();

    // Verificamos si ya existe un chat para este trabajo exacto
    const { data: existingChat } = await client
      .from('chats')
      .select('*')
      .eq('trabajo_id', trabajo_id)
      .eq('cliente_id', cliente_id)
      .eq('trabajador_id', trabajador_id)
      .single();

    if (existingChat) return existingChat;

    // Si no existe, creamos uno nuevo
    const { data: newChat, error } = await client
      .from('chats')
      .insert([{ cliente_id, trabajador_id, trabajo_id }] as any )
      .select()
      .single();

    if (error) throw new InternalServerErrorException(`Error al crear chat: ${error.message}`);
    return newChat;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoCleanupOldChats() {
    console.log('🧹 Ejecutando limpieza automática de chats antiguos...');
    
    // Supongamos que 1 mes atrás es nuestra fecha límite
    const unMesAtras = new Date();
    unMesAtras.setMonth(unMesAtras.getMonth() - 2);
    const fechaLimite = unMesAtras.toISOString();

    const client = this.supabase.getClient();

    try {
      // Paso 1: Buscar trabajos que estén "completados"
      // (Asumiendo que tienes una tabla de trabajos con un estado)
      const { data: trabajosCompletados } = await client
        .from('jobs') // Ajusta el nombre a tu tabla de trabajos
        .select('id')
        .eq('estado', 'completado');

      if (!trabajosCompletados || trabajosCompletados.length === 0) return;

      const idsTrabajos = trabajosCompletados.map((t: { id: string }) => t.id);

      // Paso 2: Buscar chats de esos trabajos cuyo "ultimo_mensaje_el" sea mayor a 1 mes
      // Nota: Si no tienes una columna 'ultimo_mensaje_el' en la tabla chats, deberías añadirla 
      // y actualizarla cada vez que se envía un mensaje, o en su defecto filtrar por 'creado_el'.
      const { data: chatsViejos } = await client
        .from('chats')
        .select('id')
        .in('trabajo_id', idsTrabajos)
        .lt('ultimo_mensaje_el', fechaLimite); // lt = Less than (Menor que) la fecha límite

      if (!chatsViejos || chatsViejos.length === 0) {
        console.log('✅ No hay chats inactivos para eliminar hoy.');
        return;
      }

      const idsChatsABorrar = chatsViejos.map((c: { id: string }) => c.id);

      // Paso 3: Eliminar los chats (Supabase en cascada borrará también sus mensajes)
      const { error } = await client
        .from('chats')
        .delete()
        .in('id', idsChatsABorrar);

      if (error) throw error;

      console.log(`🗑️ Limpieza exitosa: Se eliminaron ${idsChatsABorrar.length} chats inactivos.`);
    } catch (error) {
      console.error('❌ Error durante la limpieza automática de chats:', error);
    }
}
}