import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private supabaseClient: SupabaseClient;
  private supabaseAdminClient: SupabaseClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');
    const supabaseServiceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey || !supabaseServiceRoleKey) {
      throw new Error('Supabase credentials not found in environment variables');
    }

    // Regular client for normal operations (using anon key)
    this.supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Admin client for privileged operations (using service role key)
    this.supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
  }

  get client(): SupabaseClient {
    return this.supabaseClient;
  }

  get adminClient(): SupabaseClient {
    return this.supabaseAdminClient;
  }
}
