export declare class AuthService {
    private supabaseAdmin;
    constructor();
    validateSupabaseToken(token: string): Promise<{
        sessionToken: string;
        user: {
            id: string;
            discordId: any;
            username: any;
            avatar: any;
        };
    }>;
}
