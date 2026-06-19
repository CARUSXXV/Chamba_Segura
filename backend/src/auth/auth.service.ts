import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async register(
    email: string,
    password: string,
    username: string,
    nombre_completo: string,
  ) {
    const supabase = this.supabaseService.getClient();

    // 1. Crear el usuario en la Autenticación de Supabase
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          username,
          nombre_completo,
        },
      });

    if (authError) {
      throw new BadRequestException(authError.message);
    }

    const userId = authData.user.id;

    // 2. Crear automáticamente el registro en tu tabla "perfiles"
    const { error: profileError } = await supabase.from('perfiles').insert([
      {
        id: userId,
        username,
        nombre_completo,
      } as unknown as never,
    ]);

    // 3. Sistema de seguridad: Si falla la tabla perfiles, borramos el Auth para no dejar cuentas rotas
    if (profileError) {
      await supabase.auth.admin.deleteUser(userId);
      throw new InternalServerErrorException(
        `Error guardando en la tabla perfiles: ${profileError.message}`,
      );
    }

    return authData;
  }
}
