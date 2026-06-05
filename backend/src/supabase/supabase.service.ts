import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

@Injectable()
export class SupabaseService {
  private readonly supabase: SupabaseClient<Database>;

  constructor() {
    const supabaseUrl = (process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL) as string;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  getClient(): SupabaseClient<Database> {
    return this.supabase;
  }
}
