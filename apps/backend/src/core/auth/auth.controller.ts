import { Controller, Get, Logger, Req } from '@nestjs/common';
// JwtAuthGuard wird global registriert
import { DatabaseService } from '../../database';
import { UserProfileDto, GuildSelectionInfoDto, SessionDto } from 'shared-types';
import * as crypto from 'crypto';
import { AccessControlService } from '../permissions/access-control.service';
import { GuildsService } from '../guilds/guilds.service';

@Controller('api/v1/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name); // Instantiate Logger

  constructor(
    private readonly databaseService: DatabaseService, // Inject DatabaseService
    private readonly accessControlService: AccessControlService, // Inject AccessControlService
    private readonly guildsService: GuildsService, // Inject GuildsService
  ) {}

  // Removed /discord and /discord/callback routes as they are handled by Supabase Auth

  /**
   * Returns the current session information based on a validated Supabase JWT
   */
  @Get('session')
  // JwtAuthGuard wird global registriert
  async getSession(@Req() req: any): Promise<SessionDto> {
    this.logger.log('=== GET SESSION START ===');
    this.logger.log(`getSession: Request headers: ${JSON.stringify(req.headers)}`);
    this.logger.log(`getSession: Request method: ${req.method}`);
    this.logger.log(`getSession: Request URL: ${req.url}`);

    try { // Wrap the entire logic in a try...catch block
      // req.user now contains { id, supabaseUserId, discordId, username, avatarUrl, globalTrackingDisabled }
      const reqUser = req.user; // Das Objekt aus der JwtStrategy.validate
      this.logger.log(`getSession: Request user object from Guard/Strategy: ${JSON.stringify(reqUser)}`);

      if (!reqUser || !reqUser.id) {
         this.logger.error('getSession: User object or id is missing in req.user after guard validation!');
         this.logger.debug('getSession: req.user content:', reqUser);
         throw new Error('Invalid user data from token validation.');
      }

      // 2. Fetch available guilds for this user profile id
      this.logger.log(`getSession: Fetching guilds for user profile with id: ${reqUser.id}`);

      try {
        // Verwende user_id statt user_profile_id (basierend auf dem tatsächlichen Datenbankschema)
        this.logger.log(`getSession: Suche guild_members mit user_id = ${reqUser.id} und aktivem Bot-Status`);
        let { data: guildMembers, error: guildError } = await this.databaseService.adminClient
          .from('guild_members')
          .select(`
            guild_id,
            discord_roles,
            guilds:guild_id (
              id,
              discord_id,
              name,
              icon_url,
              bot_status,
              bot_present,
              owner_id
            )
          `)
          .eq('user_id', reqUser.id);

        this.logger.log(`getSession: Guild members query result: ${guildMembers ? `Found ${guildMembers.length} guilds` : 'No guilds found'}`);
        if (guildError) {
          this.logger.error(`getSession: Guild error: ${JSON.stringify(guildError)}`);
          this.logger.error(`getSession: Supabase error fetching guilds for user ${reqUser.id}: ${guildError.message}`, guildError);
          throw new Error(`Database error fetching guilds: ${guildError.message}`);
        }

        if (!guildMembers) {
          this.logger.warn(`getSession: No guild memberships found for user ${reqUser.id}. Returning empty list.`);
          guildMembers = [];
        }

        // 3. Transform guild data, filter by active bot status, AND get permissions
        this.logger.log(`getSession: Transforming ${guildMembers.length} guild member entries and fetching permissions.`);

        // Verwende Promise.all, um Berechtigungen parallel abzurufen
        const availableGuildsPromises = guildMembers.map(async (member) => {
          const guild = member.guilds as any;
          if (!guild || !guild.id) {
            this.logger.warn(`getSession: Found guild_member entry with null or invalid guild data for user ${reqUser.id}, member guild_id: ${member.guild_id}`);
            return null;
          }

          // Prüfen, ob der Bot auf diesem Server aktiv ist
          if (guild.bot_status !== 'active' && !guild.bot_present) {
            this.logger.debug(`getSession: Skipping guild ${guild.name} (${guild.id}) because bot is not active`);
            return null;
          }

          // Ermittle effektive Berechtigungen für diese Guild
          const effectivePermissions = await this.accessControlService.calculateEffectivePermissions(
            reqUser.id, // user_profile_id
            guild.id // guild_id (DB UUID)
          );
          this.logger.debug(`Permissions for guild ${guild.name}: ${JSON.stringify(effectivePermissions)}`);

          // Ermittle Admin-Status mit der GuildsService-Methode
          const isAdmin = this.guildsService.isUserAdminCheck(
            member.discord_roles || [],
            guild.owner_id === reqUser.id
          );

          return {
            id: guild.id,
            discord_id: guild.discord_id,
            name: guild.name,
            icon_url: guild.icon_url,
            is_admin: isAdmin, // Admin-Status
            permissions: effectivePermissions, // Berechtigungen hinzufügen
          };
        });

        // Warte auf alle Promises und filtere null-Werte
        const availableGuildsRaw = await Promise.all(availableGuildsPromises);

        // Explizite Typprüfung und Konvertierung zu GuildSelectionInfoDto[]
        const availableGuilds: GuildSelectionInfoDto[] = availableGuildsRaw
          .filter((g): g is NonNullable<typeof g> => g !== null)
          .map(g => ({
            id: g.id,
            discord_id: g.discord_id,
            name: g.name,
            icon_url: g.icon_url,
            is_admin: g.is_admin,
            permissions: g.permissions || [], // Stelle sicher, dass permissions immer ein Array ist
          }));

        this.logger.log(`getSession: Found ${availableGuilds.length} available guilds for user ${reqUser.username}`);

        // 4. Construct and return the SessionDto
        const sessionResult: SessionDto = {
          user: {
            id: reqUser.id,
            username: reqUser.username,
            avatar_url: reqUser.avatarUrl,
            discord_id: reqUser.discordId,
            global_tracking_disabled: reqUser.globalTrackingDisabled,
          },
          availableGuilds,
          token: null,
        };
        this.logger.log(`getSession: Successfully constructed session DTO for user ${reqUser.username}.`);
        this.logger.log('=== GET SESSION END ===');
        return sessionResult;
      } catch (guildError) {
        this.logger.error(`getSession: Error processing guilds: ${guildError.message}`, guildError);
        throw guildError;
      }

    } catch (error) {
      this.logger.error(`getSession: Unhandled error during session retrieval: ${error.message}`, error.stack);
      this.logger.error('=== GET SESSION END (ERROR) ===');
      throw error; // Rethrow to trigger NestJS exception handling (500 response)
    }
  }
}
