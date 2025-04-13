import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database';
export declare class BotGatewayService implements OnModuleInit, OnModuleDestroy {
    private readonly databaseService;
    private readonly configService;
    private readonly logger;
    private client;
    constructor(databaseService: DatabaseService, configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private setupEventHandlers;
    registerGuild(guildData: {
        discord_id: string;
        name: string;
        icon_url?: string;
        owner_id: string;
    }): Promise<{
        id: any;
        isNew: boolean;
    }>;
    registerGuildMember(memberData: {
        guild_id: string;
        discord_id: string;
        username: string;
        avatar_url?: string;
        discord_roles: string[];
    }): Promise<{
        id: any;
        isNew: boolean;
    }>;
    updateBotStatus(guildId: string, isActive: boolean): Promise<{
        success: boolean;
    }>;
}
