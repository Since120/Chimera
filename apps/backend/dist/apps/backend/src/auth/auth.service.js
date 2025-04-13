"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const jwt = require("jsonwebtoken");
let AuthService = class AuthService {
    supabaseAdmin;
    constructor() {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Supabase credentials not configured');
        }
        this.supabaseAdmin = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    }
    async validateSupabaseToken(token) {
        if (!process.env.SUPABASE_JWT_SECRET) {
            throw new Error('JWT secret not configured');
        }
        const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET, {
            algorithms: ['HS256']
        });
        const { data: { user }, error } = await this.supabaseAdmin.auth.getUser(token);
        if (error || !user || user.id !== decoded.sub) {
            throw new Error(`Token validation failed: ${error?.message || 'User mismatch'}`);
        }
        const sessionToken = jwt.sign({
            sub: user.id,
            exp: Math.floor(Date.now() / 1000) + 604800
        }, process.env.SUPABASE_JWT_SECRET);
        return {
            sessionToken,
            user: {
                id: user.id,
                discordId: user.user_metadata?.provider_id,
                username: user.user_metadata?.full_name,
                avatar: user.user_metadata?.avatar_url
            }
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AuthService);
//# sourceMappingURL=auth.service.js.map