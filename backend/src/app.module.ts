import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { MessagesModule } from './messages/messages.module';
import { ProfilesModule } from './profiles/profiles.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ServiciosModule } from './servicios/servicios.module';
import { ContratacionesModule } from './contrataciones/contrataciones.module';
import { PostulacionesModule } from './postulaciones/postulaciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    SupabaseModule,
    UsersModule,
    JobsModule,
    MessagesModule,
    ProfilesModule,
    ServiciosModule,
    ContratacionesModule,
    PostulacionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
