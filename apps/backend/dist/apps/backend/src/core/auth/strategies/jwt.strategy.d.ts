import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    validate(payload: any): Promise<{
        supabaseUserId: any;
        email: any;
        role: any;
        aud: any;
        iss: any;
    }>;
}
export {};
