import { Module } from '@nestjs/common';
import { ResenasController } from './resenas.controller';
import { ResenasService } from './resenas.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    controllers: [ResenasController],
    providers: [ResenasService],
    exports: [ResenasService],
})
export class ResenasModule { }