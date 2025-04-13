import { Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
declare const SupabaseStrategy_base: new (...args: any[]) => Strategy;
export declare class SupabaseStrategy extends SupabaseStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(req: Request, payload: any): Promise<{
        id: string;
        discordId: any;
        username: any;
        avatar: any;
    }>;
}
export {};
