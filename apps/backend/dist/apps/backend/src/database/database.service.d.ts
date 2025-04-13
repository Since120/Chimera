import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class DatabaseService implements OnModuleInit {
    private configService;
    private supabaseClient;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    get client(): SupabaseClient;
}
