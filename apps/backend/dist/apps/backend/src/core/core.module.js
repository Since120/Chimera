"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("../config");
const database_1 = require("../database");
const auth_1 = require("./auth");
const users_1 = require("./users");
const guilds_1 = require("./guilds");
const bot_gateway_1 = require("./bot-gateway");
let CoreModule = class CoreModule {
};
exports.CoreModule = CoreModule;
exports.CoreModule = CoreModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            database_1.DatabaseModule,
            auth_1.AuthModule,
            users_1.UsersModule,
            guilds_1.GuildsModule,
            bot_gateway_1.BotGatewayModule,
        ],
        exports: [
            database_1.DatabaseModule,
            auth_1.AuthModule,
            users_1.UsersModule,
            guilds_1.GuildsModule,
            bot_gateway_1.BotGatewayModule,
        ],
    })
], CoreModule);
//# sourceMappingURL=core.module.js.map