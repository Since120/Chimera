import { Controller, Get, Logger, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { DatabaseService } from '../../database';
import { UserProfileDto, GuildSelectionInfoDto, SessionDto } from 'shared-types';
import * as crypto from 'crypto';

@Controller('api/v1/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name); // Instantiate Logger

  constructor(
    private readonly databaseService: DatabaseService, // Inject DatabaseService
  ) {}

  // Removed /discord and /discord/callback routes as they are handled by Supabase Auth

  /**
   * Returns the current session information based on a validated Supabase JWT
   */
  @Get('session')
  @UseGuards(JwtAuthGuard) // Re-enable the guard
  async getSession(@Req() req: any): Promise<SessionDto> {
    this.logger.log('=== GET SESSION START ===');
    this.logger.log(`getSession: Request headers: ${JSON.stringify(req.headers)}`);
    this.logger.log(`getSession: Request method: ${req.method}`);
    this.logger.log(`getSession: Request URL: ${req.url}`);

    try { // Wrap the entire logic in a try...catch block
      // req.user should now contain { supabaseUserId: string } from the validated token
      this.logger.log(`getSession: Request user object: ${JSON.stringify(req.user)}`);

      const supabaseUserId = req.user?.supabaseUserId; // Add safe navigation
      if (!supabaseUserId) {
         this.logger.error('getSession: supabaseUserId is missing in req.user after guard validation!');
         this.logger.debug('getSession: req.user content:', req.user);
         throw new Error('Invalid user data from token validation.');
      }
      this.logger.log(`getSession: Validated Supabase User ID: ${supabaseUserId}`);

      // 1. Fetch user profile from our database using the Supabase User ID
      this.logger.log(`getSession: Fetching user profile for supabaseUserId: ${supabaseUserId}`);

      // Versuche zuerst, den Benutzer über auth_id zu finden (die korrekte Spalte in der Tabelle)
      this.logger.log(`getSession: Suche Benutzerprofil mit auth_id = ${supabaseUserId}`);
      let { data: userProfile, error: profileError } = await this.databaseService.adminClient
        .from('user_profiles')
        .select('*')
        .eq('auth_id', supabaseUserId) // Match against the auth_id (FK to auth.users)
        .single();

      this.logger.log(`getSession: User profile query result: ${userProfile ? 'Found' : 'Not found'}`);
      if (profileError) {
        this.logger.log(`getSession: Profile error: ${JSON.stringify(profileError)}`);
      }

      // Wenn kein Benutzer gefunden wurde, erstellen wir einen neuen
      if (profileError && profileError.code === 'PGRST116') { // PGRST116 = not found
        this.logger.warn(`getSession: No user profile found with user_id ${supabaseUserId}, creating a new profile`);

        // Hole Benutzerinformationen aus Supabase
        this.logger.log(`getSession: Fetching user info from Supabase Auth for ID: ${supabaseUserId}`);
        const { data: authUser, error: authError } = await this.databaseService.adminClient.auth.admin.getUserById(supabaseUserId);

        if (authError) {
          this.logger.error(`getSession: Error fetching user from Supabase Auth: ${authError.message}`, authError);
          this.logger.error(`getSession: Full auth error: ${JSON.stringify(authError)}`);
          throw new Error(`Error fetching user from Supabase Auth: ${authError.message}`);
        }

        this.logger.log(`getSession: Supabase Auth user data: ${JSON.stringify(authUser)}`);


        if (!authUser || !authUser.user) {
          this.logger.error(`getSession: No user found in Supabase Auth for ID ${supabaseUserId}`);
          throw new Error(`No user found in Supabase Auth for ID ${supabaseUserId}`);
        }

        // Extrahiere Benutzerinformationen aus dem Supabase-Benutzer
        const user = authUser.user;
        const identities = user.identities || [];
        this.logger.log(`getSession: User identities: ${JSON.stringify(identities)}`);

        const discordIdentity = identities.find(i => i.provider === 'discord');

        if (!discordIdentity) {
          this.logger.error(`getSession: User ${supabaseUserId} has no Discord identity`);
          throw new Error(`User ${supabaseUserId} has no Discord identity`);
        }

        this.logger.log(`getSession: Found Discord identity: ${JSON.stringify(discordIdentity)}`);


        // Erstelle ein neues Benutzerprofil mit den Informationen aus Supabase
        userProfile = {
          id: crypto.randomUUID(),
          auth_id: supabaseUserId, // Verwende auth_id statt user_id
          username: discordIdentity.identity_data?.username || user.email || 'Discord User',
          discord_id: discordIdentity.identity_data?.sub || '',
          avatar_url: discordIdentity.identity_data?.avatar_url || null,
          global_tracking_disabled: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        this.logger.log(`getSession: Neues Benutzerprofil erstellt: ${JSON.stringify(userProfile)}`);

        // Speichere den neuen Benutzer in der Datenbank
        this.logger.log(`getSession: Saving new user profile: ${JSON.stringify(userProfile)}`);

        try {
          const { data: newProfile, error: insertError } = await this.databaseService.adminClient
            .from('user_profiles')
            .insert(userProfile)
            .select()
            .single();

          if (insertError) {
            this.logger.error(`getSession: Error creating new user profile: ${insertError.message}`, insertError);
            this.logger.error(`getSession: Full insert error: ${JSON.stringify(insertError)}`);
            throw new Error(`Database error creating user profile: ${insertError.message}`);
          }

          this.logger.log(`getSession: New profile created: ${JSON.stringify(newProfile)}`);
          userProfile = newProfile;
          this.logger.log(`getSession: Created new user profile for Supabase User ID ${supabaseUserId}`);
          profileError = null;
        } catch (dbError) {
          this.logger.error(`getSession: Unexpected database error: ${dbError.message}`, dbError);
          throw new Error(`Unexpected database error: ${dbError.message}`);
        }
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
      const typedUserProfile = userProfile as UserProfileDto;

      // 2. Fetch available guilds for this user profile id
      this.logger.log(`getSession: Fetching guilds for user profile with id: ${typedUserProfile.id}`);

      try {
        // Verwende user_id statt user_profile_id (basierend auf dem tatsächlichen Datenbankschema)
        this.logger.log(`getSession: Suche guild_members mit user_id = ${typedUserProfile.id} und aktivem Bot-Status`);
        let { data: guildMembers, error: guildError } = await this.databaseService.adminClient
          .from('guild_members')
          .select(`
            guild_id,
            guilds:guild_id (
              id,
              discord_id,
              name,
              icon_url,
              bot_status,
              bot_present
            )
          `)
          .eq('user_id', typedUserProfile.id);

        this.logger.log(`getSession: Guild members query result: ${guildMembers ? `Found ${guildMembers.length} guilds` : 'No guilds found'}`);
        if (guildError) {
          this.logger.error(`getSession: Guild error: ${JSON.stringify(guildError)}`);
          this.logger.error(`getSession: Supabase error fetching guilds for user ${typedUserProfile.id}: ${guildError.message}`, guildError);
          throw new Error(`Database error fetching guilds: ${guildError.message}`);
        }

        if (!guildMembers) {
          this.logger.warn(`getSession: No guild memberships found for user ${typedUserProfile.id}. Returning empty list.`);
          guildMembers = [];
        }

        // 3. Transform guild data and filter by active bot status
        this.logger.log(`getSession: Transforming ${guildMembers.length} guild member entries.`);
        const availableGuilds = guildMembers.map(member => {
          const guild = member.guilds as any;
          if (!guild || !guild.id) {
            this.logger.warn(`getSession: Found guild_member entry with null or invalid guild data for user ${typedUserProfile.id}, member guild_id: ${member.guild_id}`);
            return null;
          }

          // Prüfen, ob der Bot auf diesem Server aktiv ist
          if (guild.bot_status !== 'active' && !guild.bot_present) {
            this.logger.debug(`getSession: Skipping guild ${guild.name} (${guild.id}) because bot is not active`);
            return null;
          }

          return {
            id: guild.id,
            discord_id: guild.discord_id,
            name: guild.name,
            icon_url: guild.icon_url,
            is_admin: false, // TODO: Implement proper admin check
          };
        }).filter(g => g !== null) as GuildSelectionInfoDto[];

        this.logger.log(`getSession: Found ${availableGuilds.length} available guilds for user ${typedUserProfile.username}`);

        // 4. Construct and return the SessionDto
        const sessionResult: SessionDto = {
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
