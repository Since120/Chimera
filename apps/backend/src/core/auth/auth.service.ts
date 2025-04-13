import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../database';
import { SessionDto, UserProfileDto } from 'shared-types';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly databaseService: DatabaseService,
  ) {}

  /**
   * Validates a user from Discord OAuth2 data
   */
  async validateUser(profile: any): Promise<UserProfileDto> {
    const { id: discordId, username, avatar } = profile;

    // Check if user exists
    const { data: existingUser, error: findError } = await this.databaseService.client
      .from('user_profiles')
      .select('*')
      .eq('discord_id', discordId)
      .single();

    if (findError && findError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw new Error(`Error finding user: ${findError.message}`);
    }

    // Generate avatar URL if available
    const avatarUrl = avatar
      ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png`
      : null;

    if (existingUser) {
      // Update user profile with latest Discord data
      const { data: updatedUser, error: updateError } = await this.databaseService.client
        .from('user_profiles')
        .update({
          username,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Error updating user: ${updateError.message}`);
      }

      return updatedUser as UserProfileDto;
    } else {
      // Create new user profile
      const { data: newUser, error: createError } = await this.databaseService.client
        .from('user_profiles')
        .insert({
          discord_id: discordId,
          username,
          avatar_url: avatarUrl,
          global_tracking_disabled: false,
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Error creating user: ${createError.message}`);
      }

      return newUser as UserProfileDto;
    }
  }

  /**
   * Creates a JWT token for the user
   */
  async login(user: UserProfileDto): Promise<SessionDto> {
    // Get guilds where the user is a member and the bot is present
    const { data: guildMembers, error: guildError } = await this.databaseService.client
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
      .eq('user_id', user.id);

    if (guildError) {
      throw new Error(`Error fetching guilds: ${guildError.message}`);
    }

    // Transform to GuildSelectionInfoDto format
    const availableGuilds = guildMembers.map(member => {
      // Typecasting to handle the nested object structure
      const guild = member.guilds as unknown as {
        id: string;
        discord_id: string;
        name: string;
        icon_url?: string;
      };

      return {
        id: guild.id,
        discord_id: guild.discord_id,
        name: guild.name,
        icon_url: guild.icon_url,
        is_admin: false, // TODO: Implement proper admin check
      };
    });

    // Create JWT payload
    const payload = {
      sub: user.id,
      discord_id: user.discord_id,
      username: user.username,
    };

    return {
      user: {
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        discord_id: user.discord_id,
        global_tracking_disabled: user.global_tracking_disabled,
      },
      availableGuilds,
      token: this.jwtService.sign(payload),
    };
  }

  /**
   * Validates a JWT token and returns the user
   */
  async validateToken(token: string): Promise<UserProfileDto | null> {
    try {
      const payload = this.jwtService.verify(token);

      const { data: user, error } = await this.databaseService.client
        .from('user_profiles')
        .select('*')
        .eq('id', payload.sub)
        .single();

      if (error) {
        return null;
      }

      return user as UserProfileDto;
    } catch (error) {
      return null;
    }
  }
}
