import { Module } from '@nestjs/common';
import { ServiciosController } from './servicios.controller';
import { ServiciosService } from './servicios.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ServiciosController],
  providers: [ServiciosService],
  exports: [ServiciosService],
})
export class ServiciosModule {}
