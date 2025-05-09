"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotGatewayModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bot_gateway_service_1 = require("./bot-gateway.service");
const bot_gateway_controller_1 = require("./bot-gateway.controller");
const database_1 = require("../../database");
const auth_1 = require("../auth");
let BotGatewayModule = class BotGatewayModule {
};
exports.BotGatewayModule = BotGatewayModule;
exports.BotGatewayModule = BotGatewayModule = __decorate([
    (0, common_1.Module)({
        imports: [database_1.DatabaseModule, auth_1.AuthModule, config_1.ConfigModule],
        controllers: [bot_gateway_controller_1.BotGatewayController],
        providers: [bot_gateway_service_1.BotGatewayService],
        exports: [bot_gateway_service_1.BotGatewayService],
    })
], BotGatewayModule);
//# sourceMappingURL=bot-gateway.module.js.map