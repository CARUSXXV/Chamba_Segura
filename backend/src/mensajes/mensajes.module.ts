import { Module } from '@nestjs/common';
import { MensajesController } from './mensajes.controller';
import { MensajesService } from './mensajes.service';
import { MensajesGateway } from './mensajes.gateway';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [MensajesController],
  providers: [MensajesService, MensajesGateway],
})
export class MensajesModule {}