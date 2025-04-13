import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { BotGatewayService } from '../../../core/bot-gateway/bot-gateway.service';
import { ChannelType, Events } from 'discord.js';

@Injectable()
export class TwoWaySyncService implements OnModuleInit {
  private readonly logger = new Logger(TwoWaySyncService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly botGatewayService: BotGatewayService,
  ) {}

  /**
   * Initialize event listeners when the module is initialized
   */
  onModuleInit() {
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for Discord events
   */
  private setupEventListeners() {
    const client = this.botGatewayService.getClient();

    // Listen for channel updates
    client.on(Events.ChannelUpdate, async (oldChannel, newChannel) => {
      if (!oldChannel.isTextBased() && !oldChannel.isVoiceBased()) return;

      await this.handleChannelUpdate(oldChannel.id, newChannel);
    });

    // Listen for channel deletions
    client.on(Events.ChannelDelete, async (channel) => {
      if (!channel.isTextBased() && !channel.isVoiceBased()) return;

      await this.handleChannelDelete(channel.id);
    });

    this.logger.log('Two-way sync event listeners set up');
  }

  /**
   * Handle channel update events
   */
  private async handleChannelUpdate(channelId: string, newChannel: any) {
    this.logger.log(`Channel updated: ${channelId}`);

    try {
      // Check if this is a category we're tracking
      const { data: category, error: categoryError } = await this.databaseService.adminClient
        .from('categories')
        .select('*')
        .eq('discord_category_id', channelId)
        .maybeSingle();

      if (categoryError) {
        this.logger.error(`Error checking category: ${categoryError.message}`);
        return;
      }

      if (category) {
        // This is a category we're tracking, update its name
        const { error: updateError } = await this.databaseService.adminClient
          .from('categories')
          .update({ name: newChannel.name })
          .eq('id', category.id);

        if (updateError) {
          this.logger.error(`Error updating category name: ${updateError.message}`);
        } else {
          this.logger.log(`Updated category name in database: ${category.id} -> ${newChannel.name}`);
        }
        return;
      }

      // Check if this is a zone we're tracking
      const { data: zone, error: zoneError } = await this.databaseService.adminClient
        .from('zones')
        .select('*')
        .eq('discord_channel_id', channelId)
        .maybeSingle();

      if (zoneError) {
        this.logger.error(`Error checking zone: ${zoneError.message}`);
        return;
      }

      if (zone) {
        // This is a zone we're tracking, update its name
        // Extract zone key from the name if it follows the [KEY] pattern
        const nameMatch = newChannel.name.match(/\\[(\\w+)\\]\\s*(.*)/);
        let zoneName = newChannel.name;
        let zoneKey = zone.zone_key;

        if (nameMatch && nameMatch.length >= 3) {
          zoneKey = nameMatch[1];
          zoneName = nameMatch[2].trim();
        }

        const { error: updateError } = await this.databaseService.adminClient
          .from('zones')
          .update({
            name: zoneName,
            zone_key: zoneKey
          })
          .eq('id', zone.id);

        if (updateError) {
          this.logger.error(`Error updating zone name: ${updateError.message}`);
        } else {
          this.logger.log(`Updated zone name in database: ${zone.id} -> ${zoneName} (${zoneKey})`);
        }
      }
    } catch (error) {
      this.logger.error(`Error in handleChannelUpdate: ${error.message}`, error.stack);
    }
  }

  /**
   * Handle channel delete events
   */
  private async handleChannelDelete(channelId: string) {
    this.logger.log(`Channel deleted: ${channelId}`);

    try {
      // Check if this is a category we're tracking
      const { data: category, error: categoryError } = await this.databaseService.adminClient
        .from('categories')
        .select('*')
        .eq('discord_category_id', channelId)
        .maybeSingle();

      if (categoryError) {
        this.logger.error(`Error checking category: ${categoryError.message}`);
        return;
      }

      if (category) {
        // This is a category we're tracking, mark it as deleted in Discord
        const { error: updateError } = await this.databaseService.adminClient
          .from('categories')
          .update({ discord_category_id: null })
          .eq('id', category.id);

        if (updateError) {
          this.logger.error(`Error updating category: ${updateError.message}`);
        } else {
          this.logger.log(`Marked category as deleted in Discord: ${category.id}`);
        }
        return;
      }

      // Check if this is a zone we're tracking
      const { data: zone, error: zoneError } = await this.databaseService.adminClient
        .from('zones')
        .select('*')
        .eq('discord_channel_id', channelId)
        .maybeSingle();

      if (zoneError) {
        this.logger.error(`Error checking zone: ${zoneError.message}`);
        return;
      }

      if (zone) {
        // This is a zone we're tracking, mark it as deleted in Discord
        const { error: updateError } = await this.databaseService.adminClient
          .from('zones')
          .update({ discord_channel_id: null })
          .eq('id', zone.id);

        if (updateError) {
          this.logger.error(`Error updating zone: ${updateError.message}`);
        } else {
          this.logger.log(`Marked zone as deleted in Discord: ${zone.id}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error in handleChannelDelete: ${error.message}`, error.stack);
    }
  }
}
