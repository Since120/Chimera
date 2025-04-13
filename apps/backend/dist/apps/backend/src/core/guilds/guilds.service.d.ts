import { DatabaseService } from '../../database';
import { GuildDto, GuildMemberDto, GuildSelectionInfoDto } from 'shared-types';
export declare class GuildsService {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    getUserGuilds(userId: string): Promise<GuildSelectionInfoDto[]>;
    getGuildById(guildId: string): Promise<GuildDto>;
    isUserMemberOfGuild(userId: string, guildId: string): Promise<boolean>;
    getUserGuildMembership(userId: string, guildId: string): Promise<GuildMemberDto>;
    checkUserGuildAdmin(userId: string, guildId: string): Promise<void>;
    private isUserAdmin;
}
