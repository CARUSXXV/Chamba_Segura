import { Module } from '@nestjs/common';
import { PostulacionesController } from './postulaciones.controller';
import { PostulacionesService } from './postulaciones.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { ChatsModule } from '../chats/chats.module';

@Module({
  imports: [SupabaseModule, ChatsModule],
  controllers: [PostulacionesController],
  providers: [PostulacionesService],
})
export class PostulacionesModule {}
