import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface ProfileUpdatePayload {
  nombre_completo?: string;
  username?: string;
  email_contacto?: string;
  telefono?: string;
}

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
      const { data: userData, error: userError } =
        await client.auth.admin.getUserById(id);
      if (userError || !userData?.user) {
        throw new NotFoundException('Perfil no encontrado');
      }

      const user = userData.user;
      const metadata = user.user_metadata as Record<string, unknown> | null;
      const profileFromAuth = {
        id: user.id,
        nombre_completo: (metadata?.nombre_completo as string | null) || null,
        username: (metadata?.username as string | null) || null,
        foto_url: (metadata?.foto_url as string | null) || null,
        email_contacto: user.email || null,
        telefono: (metadata?.telefono as string | null) || null,
        email: user.email || null,
        contractor_id: (metadata?.contractor_id as string | null) || null,
        creado_el: user.created_at || null,
        es_trabajador: (metadata?.es_trabajador as boolean) ?? false,
      };

      return profileFromAuth;
    } catch (_error) {
      throw new NotFoundException('Perfil no encontrado');
    }
  }

  async updateProfile(id: string, payload: ProfileUpdatePayload) {
    // 1. Hacemos la consulta pero LE QUITAMOS el .single() al final
    const { data, error } = await this.supabaseService
      .getClient()
      .from('perfiles')
      .update(payload as unknown as never)
      .eq('id', id)
      .select();

    // 2. Si hay un error de sintaxis en la base de datos, lo atrapamos
    if (error) {
      throw new InternalServerErrorException(
        `Error al actualizar el perfil: ${error.message}`,
      );
    }

    // 3. Si Supabase devuelve un array vacío, significa que el ID no existe o fue bloqueado
    if (!data || data.length === 0) {
      throw new NotFoundException(
        'No se pudo actualizar. El perfil no existe o está bloqueado por permisos.',
      );
    }

    // 4. Si todo sale bien, retornamos manualmente el primer (y único) objeto
    return data[0];
  }

  async deleteProfile(id: string) {
    // Borrar de la tabla pública
    const { error: dbError } = await this.supabaseService
      .getClient()
      .from('perfiles')
      .delete()
      .eq('id', id);

    if (dbError)
      throw new InternalServerErrorException('Error al eliminar datos');

    // Borrar de la autenticación de Supabase
    await this.supabaseService.getClient().auth.admin.deleteUser(id);

    return { message: 'Cuenta eliminada exitosamente' };
  }
}
