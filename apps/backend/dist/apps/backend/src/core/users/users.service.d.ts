import { DatabaseService } from '../../database';
import { UpdateUserProfileDto, UserProfileDto } from 'shared-types';
export declare class UsersService {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    getUserById(id: string): Promise<UserProfileDto>;
    getUserByDiscordId(discordId: string): Promise<UserProfileDto>;
    updateUserProfile(userId: string, updateDto: UpdateUserProfileDto): Promise<UserProfileDto>;
}
