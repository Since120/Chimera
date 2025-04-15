import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { GuildChannel } from 'discord.js';

@Injectable()
export class TwoWaySyncService implements OnModuleInit {
  private readonly logger = new Logger(TwoWaySyncService.name);

  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  /**
   * Initialize when the module is initialized
   */
  onModuleInit() {
    this.logger.log('TwoWaySyncService initialized. Waiting for events from BotGatewayService.');
  }

  /**
   * Handles channel update events received from BotGatewayService.
   * Updates the name (and potentially key for zones) in the database if the channel is tracked.
   */
  public async handleChannelUpdate(channelId: string, newChannel: GuildChannel): Promise<void> {
    this.logger.log(`Handling Channel update: ${channelId}, New Name: ${newChannel.name}`);

    try {
      // 1. Check if it's a tracked Category
      const { data: category, error: categoryError } = await this.databaseService.adminClient
        .from('categories')
        .select('id, name') // Nur relevante Felder auswählen
        .eq('discord_category_id', channelId)
        .maybeSingle();

      if (categoryError) {
        this.logger.error(`Error checking category during update sync: ${categoryError.message}`);
        // Nicht abbrechen, könnte eine Zone sein
      }

      if (category) {
        if (category.name !== newChannel.name) {
            this.logger.debug(`Tracked category ${category.id} name changed in Discord. Updating DB...`);
            const { error: updateError } = await this.databaseService.adminClient
              .from('categories')
              .update({ name: newChannel.name })
              .eq('id', category.id);
            if (updateError) {
              this.logger.error(`Error updating category name in DB: ${updateError.message}`);
            } else {
              this.logger.log(`Synced category name update: ${category.id} -> ${newChannel.name}`);
            }
        } else {
             this.logger.debug(`Category name for ${channelId} (ID: ${category.id}) hasn't changed.`);
        }
        return; // It was a category, stop processing here
      }

      // 2. Check if it's a tracked Zone
      const { data: zone, error: zoneError } = await this.databaseService.adminClient
        .from('zones')
        .select('id, name, zone_key') // Nur relevante Felder auswählen
        .eq('discord_channel_id', channelId)
        .maybeSingle();

      if (zoneError) {
        this.logger.error(`Error checking zone during update sync: ${zoneError.message}`);
        return; // If we can't check zones, stop
      }

      if (zone) {
        // --- Verbesserte Namens/Key-Extraktion ---
        let newDbZoneName = newChannel.name;
        let newDbZoneKey = zone.zone_key;

        const nameMatch = newChannel.name.match(/^\[([a-zA-Z0-9_\-]+)\]\s*(.+)$/);
        if (nameMatch && nameMatch.length === 3) {
            newDbZoneKey = nameMatch[1];
            newDbZoneName = nameMatch[2].trim();
            this.logger.debug(`Extracted key '${newDbZoneKey}' and name '${newDbZoneName}' from updated channel name.`);
        } else {
            this.logger.debug(`Updated channel name '${newChannel.name}' does not match key pattern. Treating as full name.`);
            // Behalte alten Key bei, Name wird der volle neue Name
            newDbZoneName = newChannel.name;
            newDbZoneKey = zone.zone_key;
        }

        // --- Update DB only if name or key changed ---
        if (zone.name !== newDbZoneName || zone.zone_key !== newDbZoneKey) {
            this.logger.debug(`Tracked zone ${zone.id} name/key changed in Discord. Updating DB...`);
            const { error: updateError } = await this.databaseService.adminClient
              .from('zones')
              .update({
                name: newDbZoneName,
                zone_key: newDbZoneKey
              })
              .eq('id', zone.id);

            if (updateError) {
              this.logger.error(`Error updating zone name/key in DB: ${updateError.message}`);
            } else {
              this.logger.log(`Synced zone name/key update: ${zone.id} -> ${newDbZoneName} (${newDbZoneKey})`);
            }
        } else {
             this.logger.debug(`Zone name and key for ${channelId} (ID: ${zone.id}) haven't changed.`);
        }
        return; // It was a zone, stop processing here
      }

       this.logger.debug(`Channel ${channelId} updated, but it's not a tracked category or zone.`);

    } catch (error) {
      this.logger.error(`Error in handleChannelUpdate for ${channelId}: ${error.message}`, error.stack);
    }
  }

  /**
   * Handles channel delete events received from BotGatewayService.
   * Sets the corresponding discord_..._id to null in the database if the channel was tracked.
   */
  public async handleChannelDelete(channelId: string): Promise<void> {
    this.logger.log(`Handling Channel delete: ${channelId}`);

    try {
      // 1. Check Categories and update if found
      const { data: category, error: categoryUpdateError } = await this.databaseService.adminClient
        .from('categories')
        .update({ discord_category_id: null })
        .eq('discord_category_id', channelId)
        .select('id') // Select something to know if a row was updated
        .maybeSingle(); // Use maybeSingle to handle case where nothing matches

      if (categoryUpdateError) {
        this.logger.error(`Error trying to nullify discord_category_id for ${channelId}: ${categoryUpdateError.message}`);
        // Do not return yet, it might be a zone
      }

      if (category) { // Check if category is not null, meaning a row was found and updated
          this.logger.log(`Marked category ${category.id} as deleted in Discord (discord_category_id=null)`);
          return; // Successfully handled as a category, stop processing
      }

      // 2. Check Zones and update if found
      const { data: zone, error: zoneUpdateError } = await this.databaseService.adminClient
        .from('zones')
        .update({ discord_channel_id: null })
        .eq('discord_channel_id', channelId)
        .select('id') // Select something to know if a row was updated
        .maybeSingle();

      if (zoneUpdateError) {
        this.logger.error(`Error trying to nullify discord_channel_id for zone ${channelId}: ${zoneUpdateError.message}`);
        return; // Stop processing here if error occurs during zone check
      }

      if (zone) { // Check if zone is not null, meaning a row was found and updated
          this.logger.log(`Marked zone ${zone.id} as deleted in Discord (discord_channel_id=null)`);
          return; // Successfully handled as a zone, stop processing
      }

       this.logger.debug(`Deleted channel ${channelId} was not a tracked category or zone.`);

    } catch (error) {
      this.logger.error(`Error in handleChannelDelete for ${channelId}: ${error.message}`, error.stack);
    }
  }
}
