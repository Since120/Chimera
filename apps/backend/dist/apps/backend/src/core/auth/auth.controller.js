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
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const config_1 = require("@nestjs/config");
const database_1 = require("../../database");
const crypto = require("crypto");
let AuthController = AuthController_1 = class AuthController {
    authService;
    configService;
    databaseService;
    logger = new common_1.Logger(AuthController_1.name);
    constructor(authService, configService, databaseService) {
        this.authService = authService;
        this.configService = configService;
        this.databaseService = databaseService;
    }
    async getSession(req) {
        try {
            const supabaseUserId = req.user?.supabaseUserId;
            if (!supabaseUserId) {
                this.logger.error('getSession: supabaseUserId is missing in req.user after guard validation!');
                this.logger.debug('getSession: req.user content:', req.user);
                throw new Error('Invalid user data from token validation.');
            }
            this.logger.log(`getSession: Validated Supabase User ID: ${supabaseUserId}`);
            this.logger.debug(`getSession: Fetching user profile for supabaseUserId: ${supabaseUserId}`);
            let { data: userProfile, error: profileError } = await this.databaseService.client
                .from('user_profiles')
                .select('*')
                .eq('user_id', supabaseUserId)
                .single();
            if (profileError && profileError.code === 'PGRST116') {
                this.logger.warn(`getSession: No user profile found with user_id ${supabaseUserId}, trying to find by email or creating a new profile`);
                const { data: authUser, error: authError } = await this.databaseService.client.auth.admin.getUserById(supabaseUserId);
                if (authError) {
                    this.logger.error(`getSession: Error fetching user from Supabase Auth: ${authError.message}`, authError);
                }
                if (authUser && authUser.user) {
                    const user = authUser.user;
                    const identities = user.identities || [];
                    const discordIdentity = identities.find(i => i.provider === 'discord');
                    userProfile = {
                        id: crypto.randomUUID(),
                        user_id: supabaseUserId,
                        username: discordIdentity?.identity_data?.username || user.email || 'Discord User',
                        discord_id: discordIdentity?.identity_data?.sub || '123456789',
                        avatar_url: discordIdentity?.identity_data?.avatar_url || null,
                        global_tracking_disabled: false,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                }
                else {
                    userProfile = {
                        id: crypto.randomUUID(),
                        user_id: supabaseUserId,
                        username: 'Discord User',
                        discord_id: '123456789',
                        avatar_url: null,
                        global_tracking_disabled: false,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                }
                const { data: newProfile, error: insertError } = await this.databaseService.client
                    .from('user_profiles')
                    .insert(userProfile)
                    .select()
                    .single();
                if (insertError) {
                    this.logger.error(`getSession: Error creating new user profile: ${insertError.message}`, insertError);
                    throw new Error(`Database error creating user profile: ${insertError.message}`);
                }
                userProfile = newProfile;
                this.logger.log(`getSession: Created new user profile for Supabase User ID ${supabaseUserId}`);
                profileError = null;
            }
            if (profileError) {
                this.logger.error(`getSession: Supabase error fetching user profile for Supabase User ID ${supabaseUserId}: ${profileError.message}`, profileError);
                throw new Error(`Database error fetching user profile: ${profileError.message}`);
            }
            if (!userProfile) {
                this.logger.error(`getSession: Could not find user profile for Supabase User ID ${supabaseUserId}. This might indicate an issue with profile creation/sync.`);
                throw new Error(`User profile not found for Supabase User ID ${supabaseUserId}`);
            }
            this.logger.log(`getSession: Found user profile: ${userProfile.username} (ID: ${userProfile.id})`);
            const typedUserProfile = userProfile;
            this.logger.debug(`getSession: Fetching guilds for user_profile_id: ${typedUserProfile.id}`);
            let { data: guildMembers, error: guildError } = await this.databaseService.client
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
                .eq('user_profile_id', typedUserProfile.id);
            if (guildError) {
                this.logger.error(`getSession: Supabase error fetching guilds for user ${typedUserProfile.id}: ${guildError.message}`, guildError);
                throw new Error(`Database error fetching guilds: ${guildError.message}`);
            }
            if (!guildMembers) {
                this.logger.warn(`getSession: No guild memberships found for user ${typedUserProfile.id}. Returning empty list.`);
                guildMembers = [];
            }
            this.logger.debug(`getSession: Transforming ${guildMembers.length} guild member entries.`);
            const availableGuilds = guildMembers.map(member => {
                const guild = member.guilds;
                if (!guild || !guild.id) {
                    this.logger.warn(`getSession: Found guild_member entry with null or invalid guild data for user ${typedUserProfile.id}, member guild_id: ${member.guild_id}`);
                    return null;
                }
                return {
                    id: guild.id,
                    discord_id: guild.discord_id,
                    name: guild.name,
                    icon_url: guild.icon_url,
                    is_admin: false,
                };
            }).filter(g => g !== null);
            this.logger.log(`getSession: Found ${availableGuilds.length} available guilds for user ${typedUserProfile.username}`);
            const sessionResult = {
                user: {
                    id: typedUserProfile.id,
                    username: typedUserProfile.username,
                    avatar_url: typedUserProfile.avatar_url,
                    discord_id: typedUserProfile.discord_id,
                    global_tracking_disabled: typedUserProfile.global_tracking_disabled,
                },
                availableGuilds,
                token: null,
            };
            this.logger.log(`getSession: Successfully constructed session DTO for user ${typedUserProfile.username}.`);
            return sessionResult;
        }
        catch (error) {
            this.logger.error(`getSession: Unhandled error during session retrieval: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('session'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getSession", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)('api/v1/auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService,
        database_1.DatabaseService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map