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
exports.BotGatewayController = void 0;
const common_1 = require("@nestjs/common");
const bot_gateway_service_1 = require("./bot-gateway.service");
const auth_1 = require("../auth");
let BotGatewayController = class BotGatewayController {
    botGatewayService;
    constructor(botGatewayService) {
        this.botGatewayService = botGatewayService;
    }
    async registerGuild(guildData) {
        return this.botGatewayService.registerGuild(guildData);
    }
    async registerGuildMember(memberData) {
        return this.botGatewayService.registerGuildMember(memberData);
    }
    async updateBotStatus(data) {
        return this.botGatewayService.updateBotStatus(data.guild_id, data.is_present);
    }
};
exports.BotGatewayController = BotGatewayController;
__decorate([
    (0, common_1.Post)('register-guild'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotGatewayController.prototype, "registerGuild", null);
__decorate([
    (0, common_1.Post)('register-guild-member'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotGatewayController.prototype, "registerGuildMember", null);
__decorate([
    (0, common_1.Post)('update-bot-status'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotGatewayController.prototype, "updateBotStatus", null);
exports.BotGatewayController = BotGatewayController = __decorate([
    (0, common_1.Controller)('bot-gateway'),
    (0, common_1.UseGuards)(auth_1.JwtAuthGuard),
    __metadata("design:paramtypes", [bot_gateway_service_1.BotGatewayService])
], BotGatewayController);
//# sourceMappingURL=bot-gateway.controller.js.map