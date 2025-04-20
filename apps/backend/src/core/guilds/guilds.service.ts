import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database';
import { GuildDto, GuildMemberDto, GuildSelectionInfoDto } from 'shared-types';

@Injectable()
export class GuildsService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Get all guilds available to a user
   * @deprecated Use direct database access and AccessControlService in AuthController instead
   */
  async getUserGuilds(userId: string): Promise<Omit<GuildSelectionInfoDto, 'permissions'>[]> {
    const { data, error } = await this.databaseService.adminClient
      .from('guild_members')
      .select(`
        guild_id,
        discord_roles,
        guilds:guild_id (
          id,
          discord_id,
          name,
          icon_url,
          owner_id
        )
      `)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to fetch user guilds: ${error.message}`);
    }

    return data.map(item => {
      // Typecasting to handle the nested object structure
      const guild = item.guilds as unknown as {
        id: string;
        discord_id: string;
        name: string;
        icon_url?: string;
        owner_id: string;
      };

      return {
        id: guild.id,
        discord_id: guild.discord_id,
        name: guild.name,
        icon_url: guild.icon_url,
        is_admin: this.isUserAdminCheck(item.discord_roles, guild.owner_id === userId),
      };
    });
  }

  /**
   * Get a guild by ID
   */
  async getGuildById(guildId: string): Promise<GuildDto> {
    const { data, error } = await this.databaseService.adminClient
      .from('guilds')
      .select('*')
      .eq('id', guildId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Guild with ID ${guildId} not found`);
    }

    return data as GuildDto;
  }

  /**
   * Check if a user is a member of a guild
   */
  async isUserMemberOfGuild(userId: string, guildId: string): Promise<boolean> {
    const { data, error } = await this.databaseService.adminClient
      .from('guild_members')
      .select('id')
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .single();

    if (error || !data) {
      return false;
    }

    return true;
  }

  /**
   * Get a user's membership in a guild
   */
  async getUserGuildMembership(
    userId: string,
    guildId: string,
  ): Promise<GuildMemberDto> {
    const { data, error } = await this.databaseService.adminClient
      .from('guild_members')
      .select('*')
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .single();

    if (error || !data) {
      throw new NotFoundException(
        `User ${userId} is not a member of guild ${guildId}`,
      );
    }

    return data as GuildMemberDto;
  }

  /**
   * Check if a user has admin permissions in a guild
   */
  async checkUserGuildAdmin(userId: string, guildId: string): Promise<void> {
    // Get guild to check if user is owner
    const { data: guild, error: guildError } = await this.databaseService.adminClient
      .from('guilds')
      .select('owner_id')
      .eq('id', guildId)
      .single();

    if (guildError || !guild) {
      throw new NotFoundException(`Guild with ID ${guildId} not found`);
    }

    // If user is owner, they have admin permissions
    if (guild.owner_id === userId) {
      return;
    }

    // Otherwise, check if user has admin role
    const { data: member, error: memberError } = await this.databaseService.adminClient
      .from('guild_members')
      .select('discord_roles')
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .single();

    if (memberError || !member) {
      throw new ForbiddenException(
        `User ${userId} is not a member of guild ${guildId}`,
      );
    }

    // Check if user has admin permissions based on roles
    if (!this.isUserAdminCheck(member.discord_roles, false)) {
      throw new ForbiddenException(
        `User ${userId} does not have admin permissions in guild ${guildId}`,
      );
    }
  }

  /**
   * Helper method to check if a user has admin permissions based on roles or ownership.
   * Made public to be used by AuthController.
   */
  public isUserAdminCheck(roles: string[] | null, isOwner: boolean): boolean {
    if (isOwner) {
      return true;
    }

    if (!roles || !Array.isArray(roles)) {
      return false;
    }

    // Check for admin or manage server permissions
    // This is a simplified check - in a real app, you'd check for specific Discord permission flags
    return roles.some(role =>
      role.toLowerCase().includes('admin') ||
      role.toLowerCase().includes('manage') ||
      role.toLowerCase().includes('owner')
    );
  }
}
