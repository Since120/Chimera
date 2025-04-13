import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database';
import { SessionDto } from 'shared-types';
export declare class AuthController {
    private readonly authService;
    private readonly configService;
    private readonly databaseService;
    private readonly logger;
    constructor(authService: AuthService, configService: ConfigService, databaseService: DatabaseService);
    getSession(req: any): Promise<SessionDto>;
}
