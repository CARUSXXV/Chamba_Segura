import { Module } from '@nestjs/common';
import { ContratacionesController } from './contrataciones.controller';
import { ContratacionesService } from './contrataciones.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { ServiciosModule } from '../servicios/servicios.module';

@Module({
  imports: [SupabaseModule, ServiciosModule],
  controllers: [ContratacionesController],
  providers: [ContratacionesService],
})
export class ContratacionesModule {}
