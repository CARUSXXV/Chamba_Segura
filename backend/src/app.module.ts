import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { MessagesModule } from './messages/messages.module';
import { SupabaseService } from './supabase/supabase.service';

@Module({
  imports: [AuthModule, UsersModule, JobsModule, MessagesModule],
  controllers: [AppController],
  providers: [AppService, SupabaseService],
})
export class AppModule {}
