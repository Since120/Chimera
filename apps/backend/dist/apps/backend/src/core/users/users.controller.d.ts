import { UsersService } from './users.service';
import { UpdateUserProfileDto } from 'shared-types';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getCurrentUser(req: any): Promise<any>;
    getUserById(id: string): Promise<import("shared-types").UserProfileDto>;
    updateCurrentUser(req: any, updateDto: UpdateUserProfileDto): Promise<import("shared-types").UserProfileDto>;
}
