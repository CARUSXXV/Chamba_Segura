import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }
}
