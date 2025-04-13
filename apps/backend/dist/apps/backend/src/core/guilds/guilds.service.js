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
exports.GuildsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../database");
let GuildsService = class GuildsService {
    databaseService;
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    async getUserGuilds(userId) {
        const { data, error } = await this.databaseService.client
            .from('guild_members')
            .select(`
        guild_id,
        discord_roles,
        guilds:guild_id (
          id,
          discord_id,
          name,
          icon_url,
          owner_id
        )
      `)
            .eq('user_id', userId);
        if (error) {
            throw new Error(`Failed to fetch user guilds: ${error.message}`);
        }
        return data.map(item => {
            const guild = item.guilds;
            return {
                id: guild.id,
                discord_id: guild.discord_id,
                name: guild.name,
                icon_url: guild.icon_url,
                is_admin: this.isUserAdmin(item.discord_roles, guild.owner_id === userId),
            };
        });
    }
    async getGuildById(guildId) {
        const { data, error } = await this.databaseService.client
            .from('guilds')
            .select('*')
            .eq('id', guildId)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException(`Guild with ID ${guildId} not found`);
        }
        return data;
    }
    async isUserMemberOfGuild(userId, guildId) {
        const { data, error } = await this.databaseService.client
            .from('guild_members')
            .select('id')
            .eq('user_id', userId)
            .eq('guild_id', guildId)
            .single();
        if (error || !data) {
            return false;
        }
        return true;
    }
    async getUserGuildMembership(userId, guildId) {
        const { data, error } = await this.databaseService.client
            .from('guild_members')
            .select('*')
            .eq('user_id', userId)
            .eq('guild_id', guildId)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException(`User ${userId} is not a member of guild ${guildId}`);
        }
        return data;
    }
    async checkUserGuildAdmin(userId, guildId) {
        const { data: guild, error: guildError } = await this.databaseService.client
            .from('guilds')
            .select('owner_id')
            .eq('id', guildId)
            .single();
        if (guildError || !guild) {
            throw new common_1.NotFoundException(`Guild with ID ${guildId} not found`);
        }
        if (guild.owner_id === userId) {
            return;
        }
        const { data: member, error: memberError } = await this.databaseService.client
            .from('guild_members')
            .select('discord_roles')
            .eq('user_id', userId)
            .eq('guild_id', guildId)
            .single();
        if (memberError || !member) {
            throw new common_1.ForbiddenException(`User ${userId} is not a member of guild ${guildId}`);
        }
        if (!this.isUserAdmin(member.discord_roles, false)) {
            throw new common_1.ForbiddenException(`User ${userId} does not have admin permissions in guild ${guildId}`);
        }
    }
    isUserAdmin(roles, isOwner) {
        if (isOwner) {
            return true;
        }
        if (!roles || !Array.isArray(roles)) {
            return false;
        }
        return roles.some(role => role.toLowerCase().includes('admin') ||
            role.toLowerCase().includes('manage') ||
            role.toLowerCase().includes('owner'));
    }
};
exports.GuildsService = GuildsService;
exports.GuildsService = GuildsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.DatabaseService])
], GuildsService);
//# sourceMappingURL=guilds.service.js.map