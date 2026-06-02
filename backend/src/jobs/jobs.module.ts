import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
// 1. Importas las herramientas de Supabase
import { SupabaseClient, createClient } from '@supabase/supabase-js'; 

@Module({
  providers: [
    JobsService,
    // 2. Le enseñas a NestJS cómo proveer el cliente
    {
      provide: SupabaseClient,
      useFactory: () => {
        // Aquí usas tus variables de entorno (asegúrate de tenerlas configuradas)
        return createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || 'TU_URL', 
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'TU_KEY'
        );
      },
    },
  ],
})
export class JobsModule {}