import { BotGatewayService } from './bot-gateway.service';
export declare class BotGatewayController {
    private readonly botGatewayService;
    constructor(botGatewayService: BotGatewayService);
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
    updateBotStatus(data: {
        guild_id: string;
        is_present: boolean;
    }): Promise<{
        success: boolean;
    }>;
}
