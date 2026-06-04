import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ProfilesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getProfileById(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('perfiles') // <-- Apuntando a tu tabla en español
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Perfil no encontrado');
    return data;
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