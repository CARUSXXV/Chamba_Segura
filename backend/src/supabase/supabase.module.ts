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
        const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
        return createClient(supabaseUrl, supabaseKey);
      },
    },
  ],
  exports: [SupabaseService, SupabaseClient],
})
export class SupabaseModule {}