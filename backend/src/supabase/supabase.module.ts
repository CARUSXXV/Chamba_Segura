import { Module, Global } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Global() // Esto hace que el cliente esté disponible en toda la app sin tener que importarlo en cada módulo
@Module({
  providers: [
    {
      provide: SupabaseClient, // Usamos la clase como "Token" de inyección
      useFactory: () => {
        // Asegúrate de tener estas variables en tu archivo .env
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'TU_SUPABASE_URL_AQUI';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'TU_SUPABASE_ANON_KEY_AQUI';
        
        return createClient(supabaseUrl, supabaseKey);
      },
    },
  ],
  exports: [SupabaseClient], // ¡Clave! Esto permite que otros servicios lo inyecten
})
export class SupabaseModule {}