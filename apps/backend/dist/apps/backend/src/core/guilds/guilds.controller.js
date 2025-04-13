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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildsController = void 0;
const common_1 = require("@nestjs/common");
const guilds_service_1 = require("./guilds.service");
const auth_1 = require("../auth");
let GuildsController = class GuildsController {
    guildsService;
    constructor(guildsService) {
        this.guildsService = guildsService;
    }
    async getUserGuilds(req) {
        return this.guildsService.getUserGuilds(req.user.id);
    }
    async getGuildById(req, id) {
        const isMember = await this.guildsService.isUserMemberOfGuild(req.user.id, id);
        if (!isMember) {
            return { error: 'You are not a member of this guild' };
        }
        return this.guildsService.getGuildById(id);
    }
    async getUserGuildMembership(req, id) {
        return this.guildsService.getUserGuildMembership(req.user.id, id);
    }
};
exports.GuildsController = GuildsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GuildsController.prototype, "getUserGuilds", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GuildsController.prototype, "getGuildById", null);
__decorate([
    (0, common_1.Get)(':id/membership'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GuildsController.prototype, "getUserGuildMembership", null);
exports.GuildsController = GuildsController = __decorate([
    (0, common_1.Controller)('guilds'),
    (0, common_1.UseGuards)(auth_1.JwtAuthGuard),
    __metadata("design:paramtypes", [guilds_service_1.GuildsService])
], GuildsController);
//# sourceMappingURL=guilds.controller.js.map