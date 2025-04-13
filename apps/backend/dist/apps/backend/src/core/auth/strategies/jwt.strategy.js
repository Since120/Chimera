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
var JwtStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const jwks_rsa_1 = require("jwks-rsa");
let JwtStrategy = JwtStrategy_1 = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt-supabase') {
    configService;
    logger = new common_1.Logger(JwtStrategy_1.name);
    constructor(configService) {
        const supabaseUrl = configService.get('SUPABASE_URL');
        if (!supabaseUrl) {
            throw new Error('SUPABASE_URL is not configured in environment variables.');
        }
        const supabaseJwtAudience = 'authenticated';
        const jwksUri = `${supabaseUrl}/auth/v1/.well-known/jwks.json`;
        super({
            secretOrKeyProvider: (0, jwks_rsa_1.passportJwtSecret)({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: jwksUri,
            }),
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            audience: supabaseJwtAudience,
            issuer: supabaseUrl.includes('supabase.co') ? `${supabaseUrl}/auth/v1` : supabaseUrl,
            algorithms: ['RS256'],
            ignoreExpiration: false,
            validateAudience: false,
            validateIssuer: false,
        });
        this.configService = configService;
        this.logger.log(`Initialized JwtStrategy for Supabase with JWKS URI: ${jwksUri}`);
    }
    async validate(payload) {
        this.logger.log(`Validating Supabase JWT payload: ${JSON.stringify(payload, null, 2)}`);
        if (!payload.sub) {
            this.logger.warn('Supabase JWT payload is missing required claim: sub (Supabase User ID). Trying to use alternative claims.');
            if (payload.user_id) {
                this.logger.log('Using user_id claim instead of sub');
                payload.sub = payload.user_id;
            }
            else if (payload.id) {
                this.logger.log('Using id claim instead of sub');
                payload.sub = payload.id;
            }
            else {
                this.logger.error('No suitable user identifier found in token payload');
                throw new common_1.UnauthorizedException('Invalid token claims: No user identifier found.');
            }
        }
        return {
            supabaseUserId: payload.sub,
            email: payload.email,
            role: payload.role,
            aud: payload.aud,
            iss: payload.iss,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = JwtStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map