import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../database';
import { SessionDto, UserProfileDto } from 'shared-types';
export declare class AuthService {
    private readonly jwtService;
    private readonly databaseService;
    constructor(jwtService: JwtService, databaseService: DatabaseService);
    validateUser(profile: any): Promise<UserProfileDto>;
    login(user: UserProfileDto): Promise<SessionDto>;
    validateToken(token: string): Promise<UserProfileDto | null>;
}
