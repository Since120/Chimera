import { AuthService } from './auth.service';
import { Response } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    handleSession(authHeader: string, body: {
        refresh_token?: string;
    }, res: Response): Promise<Response<any, Record<string, any>>>;
}
