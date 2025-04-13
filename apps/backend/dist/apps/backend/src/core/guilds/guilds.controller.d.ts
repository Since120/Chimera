import { GuildsService } from './guilds.service';
export declare class GuildsController {
    private readonly guildsService;
    constructor(guildsService: GuildsService);
    getUserGuilds(req: any): Promise<import("shared-types").GuildSelectionInfoDto[]>;
    getGuildById(req: any, id: string): Promise<import("shared-types").GuildDto | {
        error: string;
    }>;
    getUserGuildMembership(req: any, id: string): Promise<import("shared-types").GuildMemberDto>;
}
