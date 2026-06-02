import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async register(
    email: string,
    password: string,
    username: string,
    nombre_completo: string,
    es_trabajador: boolean,
  ) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signUp({
        email,
        password, 
        options: {
          data: {
            username,
            nombre_completo,
            es_trabajador,
          },
        },
      });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }
}
