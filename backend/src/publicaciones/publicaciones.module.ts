import { Module } from '@nestjs/common';
import { PublicacionesController } from './publicaciones.controller';
import { PublicacionesService } from './publicaciones.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    controllers: [PublicacionesController],
    providers: [PublicacionesService],
    exports: [PublicacionesService],
})
export class PublicacionesModule { }
