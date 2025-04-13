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
var BotGatewayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotGatewayService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_1 = require("../../database");
const discord_js_1 = require("discord.js");
let BotGatewayService = BotGatewayService_1 = class BotGatewayService {
    databaseService;
    configService;
    logger = new common_1.Logger(BotGatewayService_1.name);
    client;
    constructor(databaseService, configService) {
        this.databaseService = databaseService;
        this.configService = configService;
        this.client = new discord_js_1.Client({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMembers,
                discord_js_1.GatewayIntentBits.GuildVoiceStates,
            ],
        });
        this.setupEventHandlers();
    }
    async onModuleInit() {
        try {
            const token = this.configService.get('DISCORD_BOT_TOKEN');
            if (!token) {
                this.logger.error('DISCORD_BOT_TOKEN ist nicht konfiguriert');
                return;
            }
            await this.client.login(token);
            this.logger.log(`Bot erfolgreich angemeldet als ${this.client.user?.tag}`);
        }
        catch (error) {
            this.logger.error(`Fehler beim Anmelden des Bots: ${error.message}`);
        }
    }
    async onModuleDestroy() {
        this.client.destroy();
        this.logger.log('Bot abgemeldet');
    }
    setupEventHandlers() {
        this.client.on(discord_js_1.Events.ClientReady, () => {
            this.logger.log(`Bot ist bereit: ${this.client.user?.tag}`);
        });
        this.client.on(discord_js_1.Events.GuildCreate, async (guild) => {
            try {
                this.logger.log(`Bot ist dem Server beigetreten: ${guild.name} (${guild.id})`);
                await this.registerGuild({
                    discord_id: guild.id,
                    name: guild.name,
                    icon_url: guild.iconURL() || undefined,
                    owner_id: guild.ownerId,
                });
                const members = await guild.members.fetch();
                for (const [, member] of members) {
                    if (member.user.bot)
                        continue;
                    await this.registerGuildMember({
                        guild_id: guild.id,
                        discord_id: member.id,
                        username: member.user.username,
                        avatar_url: member.user.avatarURL() || undefined,
                        discord_roles: member.roles.cache.map(role => role.id),
                    });
                }
            }
            catch (error) {
                this.logger.error(`Fehler beim Verarbeiten des GuildCreate-Events: ${error.message}`);
            }
        });
        this.client.on(discord_js_1.Events.GuildDelete, async (guild) => {
            try {
                this.logger.log(`Bot hat den Server verlassen: ${guild.name} (${guild.id})`);
                const { data: guildData, error } = await this.databaseService.client
                    .from('guilds')
                    .select('id')
                    .eq('discord_id', guild.id)
                    .single();
                if (error) {
                    this.logger.error(`Fehler beim Suchen der Guild: ${error.message}`);
                    return;
                }
                await this.updateBotStatus(guildData.id, false);
            }
            catch (error) {
                this.logger.error(`Fehler beim Verarbeiten des GuildDelete-Events: ${error.message}`);
            }
        });
        this.client.on(discord_js_1.Events.GuildMemberAdd, async (member) => {
            try {
                if (member.user.bot)
                    return;
                this.logger.log(`Neues Mitglied auf dem Server: ${member.user.username} (${member.id})`);
                const { data: guildData, error } = await this.databaseService.client
                    .from('guilds')
                    .select('id')
                    .eq('discord_id', member.guild.id)
                    .single();
                if (error) {
                    this.logger.error(`Fehler beim Suchen der Guild: ${error.message}`);
                    return;
                }
                await this.registerGuildMember({
                    guild_id: guildData.id,
                    discord_id: member.id,
                    username: member.user.username,
                    avatar_url: member.user.avatarURL() || undefined,
                    discord_roles: member.roles.cache.map(role => role.id),
                });
            }
            catch (error) {
                this.logger.error(`Fehler beim Verarbeiten des GuildMemberAdd-Events: ${error.message}`);
            }
        });
        this.client.on(discord_js_1.Events.GuildMemberRemove, async (member) => {
            try {
                if (member.user.bot)
                    return;
                this.logger.log(`Mitglied hat den Server verlassen: ${member.user.username} (${member.id})`);
                const { data: userData, error: userError } = await this.databaseService.client
                    .from('user_profiles')
                    .select('id')
                    .eq('discord_id', member.id)
                    .single();
                if (userError) {
                    this.logger.error(`Fehler beim Suchen des Users: ${userError.message}`);
                    return;
                }
                const { data: guildData, error: guildError } = await this.databaseService.client
                    .from('guilds')
                    .select('id')
                    .eq('discord_id', member.guild.id)
                    .single();
                if (guildError) {
                    this.logger.error(`Fehler beim Suchen der Guild: ${guildError.message}`);
                    return;
                }
                const { error: deleteError } = await this.databaseService.client
                    .from('guild_members')
                    .delete()
                    .eq('user_id', userData.id)
                    .eq('guild_id', guildData.id);
                if (deleteError) {
                    this.logger.error(`Fehler beim Löschen der Mitgliedschaft: ${deleteError.message}`);
                }
            }
            catch (error) {
                this.logger.error(`Fehler beim Verarbeiten des GuildMemberRemove-Events: ${error.message}`);
            }
        });
        this.client.on(discord_js_1.Events.GuildMemberUpdate, async (oldMember, newMember) => {
            try {
                if (newMember.user.bot)
                    return;
                const oldRoles = oldMember.roles.cache.map(role => role.id);
                const newRoles = newMember.roles.cache.map(role => role.id);
                if (JSON.stringify(oldRoles.sort()) === JSON.stringify(newRoles.sort())) {
                    return;
                }
                this.logger.log(`Mitglied wurde aktualisiert: ${newMember.user.username} (${newMember.id})`);
                const { data: userData, error: userError } = await this.databaseService.client
                    .from('user_profiles')
                    .select('id')
                    .eq('discord_id', newMember.id)
                    .single();
                if (userError) {
                    this.logger.error(`Fehler beim Suchen des Users: ${userError.message}`);
                    return;
                }
                const { data: guildData, error: guildError } = await this.databaseService.client
                    .from('guilds')
                    .select('id')
                    .eq('discord_id', newMember.guild.id)
                    .single();
                if (guildError) {
                    this.logger.error(`Fehler beim Suchen der Guild: ${guildError.message}`);
                    return;
                }
                const { error: updateError } = await this.databaseService.client
                    .from('guild_members')
                    .update({
                    discord_roles: newRoles,
                    updated_at: new Date().toISOString(),
                })
                    .eq('user_id', userData.id)
                    .eq('guild_id', guildData.id);
                if (updateError) {
                    this.logger.error(`Fehler beim Aktualisieren der Mitgliedschaft: ${updateError.message}`);
                }
            }
            catch (error) {
                this.logger.error(`Fehler beim Verarbeiten des GuildMemberUpdate-Events: ${error.message}`);
            }
        });
    }
    async registerGuild(guildData) {
        this.logger.log(`Registering guild: ${guildData.name} (${guildData.discord_id})`);
        const { data: existingGuild, error: findError } = await this.databaseService.client
            .from('guilds')
            .select('id')
            .eq('discord_id', guildData.discord_id)
            .single();
        if (findError && findError.code !== 'PGRST116') {
            throw new Error(`Error finding guild: ${findError.message}`);
        }
        if (existingGuild) {
            const { error: updateError } = await this.databaseService.client
                .from('guilds')
                .update({
                name: guildData.name,
                icon_url: guildData.icon_url,
                owner_id: guildData.owner_id,
                updated_at: new Date().toISOString(),
            })
                .eq('id', existingGuild.id);
            if (updateError) {
                throw new Error(`Error updating guild: ${updateError.message}`);
            }
            return { id: existingGuild.id, isNew: false };
        }
        else {
            const { data: newGuild, error: createError } = await this.databaseService.client
                .from('guilds')
                .insert({
                discord_id: guildData.discord_id,
                name: guildData.name,
                icon_url: guildData.icon_url,
                owner_id: guildData.owner_id,
            })
                .select()
                .single();
            if (createError) {
                throw new Error(`Error creating guild: ${createError.message}`);
            }
            return { id: newGuild.id, isNew: true };
        }
    }
    async registerGuildMember(memberData) {
        this.logger.log(`Registering guild member: ${memberData.username} in guild ${memberData.guild_id}`);
        const { data: user, error: userError } = await this.databaseService.client
            .from('user_profiles')
            .select('id')
            .eq('discord_id', memberData.discord_id)
            .single();
        let userId;
        if (userError && userError.code === 'PGRST116') {
            const { data: newUser, error: createUserError } = await this.databaseService.client
                .from('user_profiles')
                .insert({
                discord_id: memberData.discord_id,
                username: memberData.username,
                avatar_url: memberData.avatar_url,
                global_tracking_disabled: false,
            })
                .select()
                .single();
            if (createUserError) {
                throw new Error(`Error creating user: ${createUserError.message}`);
            }
            userId = newUser.id;
        }
        else if (userError) {
            throw new Error(`Error finding user: ${userError.message}`);
        }
        else {
            userId = user.id;
        }
        const { data: existingMember, error: findMemberError } = await this.databaseService.client
            .from('guild_members')
            .select('id')
            .eq('user_id', userId)
            .eq('guild_id', memberData.guild_id)
            .single();
        if (findMemberError && findMemberError.code !== 'PGRST116') {
            throw new Error(`Error finding guild member: ${findMemberError.message}`);
        }
        if (existingMember) {
            const { error: updateError } = await this.databaseService.client
                .from('guild_members')
                .update({
                discord_roles: memberData.discord_roles,
                updated_at: new Date().toISOString(),
            })
                .eq('id', existingMember.id);
            if (updateError) {
                throw new Error(`Error updating guild member: ${updateError.message}`);
            }
            return { id: existingMember.id, isNew: false };
        }
        else {
            const { data: newMember, error: createError } = await this.databaseService.client
                .from('guild_members')
                .insert({
                user_id: userId,
                guild_id: memberData.guild_id,
                discord_roles: memberData.discord_roles,
            })
                .select()
                .single();
            if (createError) {
                throw new Error(`Error creating guild member: ${createError.message}`);
            }
            return { id: newMember.id, isNew: true };
        }
    }
    async updateBotStatus(guildId, isActive) {
        const newStatus = isActive ? 'active' : 'inactive';
        this.logger.log(`Updating bot status for guild ${guildId} to: ${newStatus}`);
        const { error } = await this.databaseService.client
            .from('guilds')
            .update({
            bot_status: newStatus,
            updated_at: new Date().toISOString(),
        })
            .eq('id', guildId);
        if (error) {
            throw new Error(`Error updating bot status: ${error.message}`);
        }
        return { success: true };
    }
};
exports.BotGatewayService = BotGatewayService;
exports.BotGatewayService = BotGatewayService = BotGatewayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.DatabaseService,
        config_1.ConfigService])
], BotGatewayService);
//# sourceMappingURL=bot-gateway.service.js.map