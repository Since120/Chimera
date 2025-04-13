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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../database");
let UsersService = class UsersService {
    databaseService;
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    async getUserById(id) {
        const { data, error } = await this.databaseService.client
            .from('user_profiles')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return data;
    }
    async getUserByDiscordId(discordId) {
        const { data, error } = await this.databaseService.client
            .from('user_profiles')
            .select('*')
            .eq('discord_id', discordId)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException(`User with Discord ID ${discordId} not found`);
        }
        return data;
    }
    async updateUserProfile(userId, updateDto) {
        await this.getUserById(userId);
        const { data, error } = await this.databaseService.client
            .from('user_profiles')
            .update({
            ...updateDto,
            updated_at: new Date().toISOString(),
        })
            .eq('id', userId)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to update user profile: ${error.message}`);
        }
        return data;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.DatabaseService])
], UsersService);
//# sourceMappingURL=users.service.js.map