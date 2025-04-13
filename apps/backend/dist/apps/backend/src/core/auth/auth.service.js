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
const jwt_1 = require("@nestjs/jwt");
const database_1 = require("../../database");
let AuthService = class AuthService {
    jwtService;
    databaseService;
    constructor(jwtService, databaseService) {
        this.jwtService = jwtService;
        this.databaseService = databaseService;
    }
    async validateUser(profile) {
        const { id: discordId, username, avatar } = profile;
        const { data: existingUser, error: findError } = await this.databaseService.client
            .from('user_profiles')
            .select('*')
            .eq('discord_id', discordId)
            .single();
        if (findError && findError.code !== 'PGRST116') {
            throw new Error(`Error finding user: ${findError.message}`);
        }
        const avatarUrl = avatar
            ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png`
            : null;
        if (existingUser) {
            const { data: updatedUser, error: updateError } = await this.databaseService.client
                .from('user_profiles')
                .update({
                username,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            })
                .eq('id', existingUser.id)
                .select()
                .single();
            if (updateError) {
                throw new Error(`Error updating user: ${updateError.message}`);
            }
            return updatedUser;
        }
        else {
            const { data: newUser, error: createError } = await this.databaseService.client
                .from('user_profiles')
                .insert({
                discord_id: discordId,
                username,
                avatar_url: avatarUrl,
                global_tracking_disabled: false,
            })
                .select()
                .single();
            if (createError) {
                throw new Error(`Error creating user: ${createError.message}`);
            }
            return newUser;
        }
    }
    async login(user) {
        const { data: guildMembers, error: guildError } = await this.databaseService.client
            .from('guild_members')
            .select(`
        guild_id,
        guilds:guild_id (
          id,
          discord_id,
          name,
          icon_url
        )
      `)
            .eq('user_id', user.id);
        if (guildError) {
            throw new Error(`Error fetching guilds: ${guildError.message}`);
        }
        const availableGuilds = guildMembers.map(member => {
            const guild = member.guilds;
            return {
                id: guild.id,
                discord_id: guild.discord_id,
                name: guild.name,
                icon_url: guild.icon_url,
                is_admin: false,
            };
        });
        const payload = {
            sub: user.id,
            discord_id: user.discord_id,
            username: user.username,
        };
        return {
            user: {
                id: user.id,
                username: user.username,
                avatar_url: user.avatar_url,
                discord_id: user.discord_id,
                global_tracking_disabled: user.global_tracking_disabled,
            },
            availableGuilds,
            token: this.jwtService.sign(payload),
        };
    }
    async validateToken(token) {
        try {
            const payload = this.jwtService.verify(token);
            const { data: user, error } = await this.databaseService.client
                .from('user_profiles')
                .select('*')
                .eq('id', payload.sub)
                .single();
            if (error) {
                return null;
            }
            return user;
        }
        catch (error) {
            return null;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        database_1.DatabaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map