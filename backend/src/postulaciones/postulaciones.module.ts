import { Module } from '@nestjs/common';
import { PostulacionesController } from './postulaciones.controller';
import { PostulacionesService } from './postulaciones.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [PostulacionesController],
  providers: [PostulacionesService],
})
export class PostulacionesModule {}
