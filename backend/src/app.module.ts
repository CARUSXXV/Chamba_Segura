import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { ChatsModule } from './chats/chats.module';
import { MensajesModule } from './mensajes/mensajes.module';
import { ProfilesModule } from './profiles/profiles.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ServiciosModule } from './servicios/servicios.module';
import { ContratacionesModule } from './contrataciones/contrataciones.module';
import { PostulacionesModule } from './postulaciones/postulaciones.module';
import { ResenasModule } from './resenas/resenas.module';
import { PaymentsModule } from './payments/payments.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    SupabaseModule,
    UsersModule,
    JobsModule,
    ChatsModule,
    MensajesModule,
    ProfilesModule,
    ServiciosModule,
    ContratacionesModule,
    PostulacionesModule,
    ResenasModule,
    PaymentsModule,
    PublicacionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
