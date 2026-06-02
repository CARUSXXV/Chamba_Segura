import { Module, Global } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Global()
@Module({
  providers: [
    SupabaseService,
    {
      provide: SupabaseClient,
      useFactory: () => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'TU_SUPABASE_URL_AQUI';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'TU_SUPABASE_ANON_KEY_AQUI';
        return createClient(supabaseUrl, supabaseKey);
      },
    },
  ],
  exports: [SupabaseService, SupabaseClient],
})
export class SupabaseModule {}