"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildsModule = void 0;
const common_1 = require("@nestjs/common");
const guilds_service_1 = require("./guilds.service");
const guilds_controller_1 = require("./guilds.controller");
const database_1 = require("../../database");
const auth_1 = require("../auth");
let GuildsModule = class GuildsModule {
};
exports.GuildsModule = GuildsModule;
exports.GuildsModule = GuildsModule = __decorate([
    (0, common_1.Module)({
        imports: [database_1.DatabaseModule, auth_1.AuthModule],
        controllers: [guilds_controller_1.GuildsController],
        providers: [guilds_service_1.GuildsService],
        exports: [guilds_service_1.GuildsService],
    })
], GuildsModule);
//# sourceMappingURL=guilds.module.js.map