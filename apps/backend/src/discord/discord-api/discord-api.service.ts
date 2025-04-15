import { Injectable, Logger, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { BotGatewayService } from '../../core/bot-gateway/bot-gateway.service';
import {
  CategoryChannel,
  ChannelType,
  Collection,
  Guild,
  GuildBasedChannel,
  GuildMember,
  OverwriteResolvable,
  PermissionFlagsBits,
  Role,
  VoiceChannel
} from 'discord.js';

@Injectable()
export class DiscordApiService {
  private readonly logger = new Logger(DiscordApiService.name);
  private readonly apiBaseUrl = 'https://discord.com/api/v10';

  constructor(
    private readonly botGatewayService: BotGatewayService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get a guild by its ID
   */
  async getGuild(guildId: string): Promise<Guild | null> {
    try {
      return this.botGatewayService.getClient().guilds.cache.get(guildId) || null;
    } catch (error) {
      this.logger.error(`Error getting guild: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Get a channel by its ID
   */
  async getChannel(channelId: string): Promise<GuildBasedChannel | null> {
    try {
      const client = this.botGatewayService.getClient();
      const channel = client.channels.cache.get(channelId);
      return channel as GuildBasedChannel || null;
    } catch (error) {
      this.logger.error(`Error getting channel: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Get all roles for a guild
   */
  async getGuildRoles(guildId: string): Promise<Collection<string, Role> | null> {
    try {
      const guild = await this.getGuild(guildId);
      if (!guild) {
        this.logger.warn(`Guild not found: ${guildId}`);
        return null;
      }
      return guild.roles.cache;
    } catch (error) {
      this.logger.error(`Error getting guild roles: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Create a category channel in a guild
   */
  async createCategoryChannel(
    guildId: string,
    name: string,
    rolePermissions: { roleId: string; canView: boolean; canConnect: boolean }[] = [],
  ): Promise<CategoryChannel | null> {
    try {
      const guild = await this.getGuild(guildId);
      if (!guild) {
        this.logger.warn(`Guild not found: ${guildId}`);
        return null;
      }

      // Prepare permission overwrites
      const permissionOverwrites: OverwriteResolvable[] = [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: guild.client.user.id, // Bot's ID
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageRoles,
          ],
        },
      ];

      // Add role-specific permissions
      for (const rolePerm of rolePermissions) {
        const role = guild.roles.cache.get(rolePerm.roleId);
        if (role) {
          const permissions: bigint[] = [];
          if (rolePerm.canView) {
            permissions.push(PermissionFlagsBits.ViewChannel);
          }
          if (rolePerm.canConnect) {
            permissions.push(PermissionFlagsBits.Connect);
          }

          permissionOverwrites.push({
            id: rolePerm.roleId,
            allow: permissions,
          });
        }
      }

      // Create the category
      const category = await guild.channels.create({
        name,
        type: ChannelType.GuildCategory,
        permissionOverwrites,
      });

      this.logger.log(`Created category channel: ${category.name} (${category.id})`);
      return category;
    } catch (error) {
      this.logger.error(`Error creating category channel: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Create a voice channel in a category
   */
  async createVoiceChannel(
    guildId: string,
    name: string,
    categoryId: string,
    userLimit?: number,
  ): Promise<VoiceChannel | null> {
    try {
      const guild = await this.getGuild(guildId);
      if (!guild) {
        this.logger.warn(`Guild not found: ${guildId}`);
        return null;
      }

      const category = guild.channels.cache.get(categoryId) as CategoryChannel;
      if (!category) {
        this.logger.warn(`Category not found: ${categoryId}`);
        return null;
      }

      // Create the voice channel
      const voiceChannel = await guild.channels.create({
        name,
        type: ChannelType.GuildVoice,
        parent: category,
        userLimit: userLimit || undefined,
      });

      this.logger.log(`Created voice channel: ${voiceChannel.name} (${voiceChannel.id})`);
      return voiceChannel;
    } catch (error) {
      this.logger.error(`Error creating voice channel: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Create a text channel in a category
   */
  async createTextChannel(
    guildId: string,
    name: string,
    categoryId: string,
  ): Promise<GuildBasedChannel | null> {
    try {
      const guild = await this.getGuild(guildId);
      if (!guild) {
        this.logger.warn(`Guild not found: ${guildId}`);
        return null;
      }

      const category = guild.channels.cache.get(categoryId) as CategoryChannel;
      if (!category) {
        this.logger.warn(`Category not found: ${categoryId}`);
        return null;
      }

      // Create the text channel
      const textChannel = await guild.channels.create({
        name,
        type: ChannelType.GuildText,
        parent: category,
      });

      this.logger.log(`Created text channel: ${textChannel.name} (${textChannel.id})`);
      return textChannel;
    } catch (error) {
      this.logger.error(`Error creating text channel: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Update a category channel
   */
  async updateCategoryChannel(
    categoryId: string,
    updates: {
      name?: string;
      rolePermissions?: { roleId: string; canView: boolean; canConnect: boolean }[];
    },
  ): Promise<CategoryChannel | null> {
    try {
      const channel = await this.getChannel(categoryId) as CategoryChannel;
      if (!channel || channel.type !== ChannelType.GuildCategory) {
        this.logger.warn(`Category not found or not a category: ${categoryId}`);
        return null;
      }

      // Update name if provided
      if (updates.name && updates.name !== channel.name) {
        await channel.setName(updates.name);
      }

      // Update permissions if provided
      if (updates.rolePermissions) {
        const guild = channel.guild;

        // Start with default permissions
        const permissionOverwrites: OverwriteResolvable[] = [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: guild.client.user.id, // Bot's ID
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.ManageChannels,
              PermissionFlagsBits.ManageRoles,
            ],
          },
        ];

        // Add role-specific permissions
        for (const rolePerm of updates.rolePermissions) {
          const role = guild.roles.cache.get(rolePerm.roleId);
          if (role) {
            const permissions: bigint[] = [];
            if (rolePerm.canView) {
              permissions.push(PermissionFlagsBits.ViewChannel);
            }
            if (rolePerm.canConnect) {
              permissions.push(PermissionFlagsBits.Connect);
            }

            permissionOverwrites.push({
              id: rolePerm.roleId,
              allow: permissions,
            });
          }
        }

        await channel.permissionOverwrites.set(permissionOverwrites);
      }

      this.logger.log(`Updated category channel: ${channel.name} (${channel.id})`);
      return channel;
    } catch (error) {
      this.logger.error(`Error updating category channel: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Update a voice channel
   */
  async updateVoiceChannel(
    channelId: string,
    updates: {
      name?: string;
      userLimit?: number;
      categoryId?: string;
    },
  ): Promise<VoiceChannel | null> {
    try {
      const channel = await this.getChannel(channelId) as VoiceChannel;
      if (!channel || channel.type !== ChannelType.GuildVoice) {
        this.logger.warn(`Voice channel not found or not a voice channel: ${channelId}`);
        return null;
      }

      // Update name if provided
      if (updates.name && updates.name !== channel.name) {
        await channel.setName(updates.name);
      }

      // Update user limit if provided
      if (updates.userLimit !== undefined && updates.userLimit !== channel.userLimit) {
        await channel.setUserLimit(updates.userLimit);
      }

      // Update category if provided
      if (updates.categoryId && updates.categoryId !== channel.parentId) {
        const category = channel.guild.channels.cache.get(updates.categoryId) as CategoryChannel;
        if (category && category.type === ChannelType.GuildCategory) {
          await channel.setParent(category);
        }
      }

      this.logger.log(`Updated voice channel: ${channel.name} (${channel.id})`);
      return channel;
    } catch (error) {
      this.logger.error(`Error updating voice channel: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Delete a channel
   */
  async deleteChannel(channelId: string): Promise<boolean> {
    try {
      const channel = await this.getChannel(channelId);
      if (!channel) {
        this.logger.warn(`Channel not found: ${channelId}`);
        return false;
      }

      await channel.delete();
      this.logger.log(`Deleted channel: ${channelId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting channel: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Get a guild member
   */
  async getGuildMember(guildId: string, userId: string): Promise<GuildMember | null> {
    try {
      const guild = await this.getGuild(guildId);
      if (!guild) {
        this.logger.warn(`Guild not found: ${guildId}`);
        return null;
      }

      return guild.members.cache.get(userId) ||
        (await guild.members.fetch(userId).catch(() => null));
    } catch (error) {
      this.logger.error(`Error getting guild member: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Rename a channel or category using direct Discord REST API call.
   * Throws specific exceptions for error handling in the processor.
   */
  async renameChannelOrCategory(channelId: string, newName: string): Promise<void> {
    const botToken = this.configService.get<string>('DISCORD_BOT_TOKEN');
    const url = `${this.apiBaseUrl}/channels/${channelId}`;
    const headers = {
      Authorization: `Bot ${botToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'ProjectChimera (https://github.com/Since120/Chimera, v0.1)',
    };
    const body = { name: newName };

    this.logger.debug(`[Direct API Call] Attempting PATCH ${url} with body: ${JSON.stringify(body)}`);

    try {
      const response = await this.httpService.patch(url, body, { headers }).toPromise();
      this.logger.log(`[Direct API Call] Successfully renamed channel ${channelId} to "${newName}"`);
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      this.logger.error(`[Direct API Call] Failed to rename channel ${channelId}. Status: ${axiosError.response?.status}, Response: ${JSON.stringify(axiosError.response?.data)}`, axiosError.stack);

      if (axiosError.response) {
        const status = axiosError.response.status;
        const responseData = axiosError.response.data;

        if (status === 404) {
          throw new NotFoundException(`Channel ${channelId} not found via direct API call.`);
        } else if (status === 429) {
          // Rate Limit - wirf einen speziellen Fehler mit retry_after Information
          const retryAfterSeconds = responseData?.retry_after || 10; // Default 10s
          const rateLimitError = new HttpException(
            `Rate Limit Exceeded. Retry after ${retryAfterSeconds}s.`,
            HttpStatus.TOO_MANY_REQUESTS // Status 429
          );
          // Füge retry_after als Property hinzu, damit der Processor es lesen kann
          (rateLimitError as any).retryAfter = retryAfterSeconds;
          throw rateLimitError;
        } else if (status === 403) {
          throw new HttpException(`Forbidden: Missing permissions to rename channel ${channelId}.`, HttpStatus.FORBIDDEN);
        } else {
          // Anderer HTTP-Fehler
          throw new HttpException(`Failed to rename channel ${channelId}. Status: ${status}`, status);
        }
      } else {
        // Netzwerkfehler o.ä. ohne Response
        throw new HttpException(`Network or unknown error renaming channel ${channelId}: ${axiosError.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
