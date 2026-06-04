import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ProfilesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getProfileById(id: string) {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('perfiles')
      .select('*')
      .eq('id', id)
      .single();

    // Si existe la fila en la tabla `perfiles`, retornarla
    if (!error && data) return data;

    // Si no hay fila, intentar construir el perfil desde Auth (user_metadata)
    try {
      const { data: userData, error: userError } = await client.auth.admin.getUserById(id as string);
      if (userError || !userData?.user) {
        throw new NotFoundException('Perfil no encontrado');
      }

      const user = userData.user;
      const profileFromAuth = {
        id: user.id,
        nombre_completo: (user.user_metadata as any)?.nombre_completo || null,
        username: (user.user_metadata as any)?.username || null,
        foto_url: (user.user_metadata as any)?.foto_url || null,
        email_contacto: user.email || null,
        telefono: (user.user_metadata as any)?.telefono || null,
        email: user.email || null,
        contractor_id: (user.user_metadata as any)?.contractor_id || null,
        creado_el: user.created_at || null,
        es_trabajador: (user.user_metadata as any)?.es_trabajador ?? false,
      };

      return profileFromAuth;
    } catch (err) {
      throw new NotFoundException('Perfil no encontrado');
    }
  }

 async updateProfile(id: string, payload: any) {
    // 1. Hacemos la consulta pero LE QUITAMOS el .single() al final
    const { data, error } = await this.supabaseService
      .getClient()
      .from('perfiles')
      .update(payload)
      .eq('id', id)
      .select();

    // 2. Si hay un error de sintaxis en la base de datos, lo atrapamos
    if (error) {
      throw new InternalServerErrorException(`Error al actualizar el perfil: ${error.message}`);
    }

    // 3. Si Supabase devuelve un array vacío, significa que el ID no existe o fue bloqueado
    if (!data || data.length === 0) {
      throw new NotFoundException('No se pudo actualizar. El perfil no existe o está bloqueado por permisos.');
    }

    // 4. Si todo sale bien, retornamos manualmente el primer (y único) objeto
    return data[0];
  }

  async deleteProfile(id: string) {
    // Borrar de la tabla pública
    const { error: dbError } = await this.supabaseService.getClient()
      .from('perfiles')
      .delete()
      .eq('id', id);

    if (dbError) throw new InternalServerErrorException('Error al eliminar datos');

    // Borrar de la autenticación de Supabase
    await this.supabaseService.getClient().auth.admin.deleteUser(id);

    return { message: 'Cuenta eliminada exitosamente' };
  }
}