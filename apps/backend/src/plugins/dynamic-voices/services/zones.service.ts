import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { DiscordApiService } from '../../../discord/discord-api/discord-api.service';
import { GuildService } from '../../../core/guild/services/guild.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Redis } from '@upstash/redis';
import { ZoneDto, CreateZoneDto, UpdateZoneDto } from 'shared-types';

@Injectable()
export class ZonesService {
  private readonly logger = new Logger(ZonesService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly discordApiService: DiscordApiService,
    private readonly guildService: GuildService,
    @InjectQueue('channel-rename') private readonly channelRenameQueue: Queue,
    @Inject('UPSTASH_REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  /**
   * Create a new zone
   */
  async createZone(categoryId: string, createZoneDto: CreateZoneDto): Promise<ZoneDto> {
    this.logger.log(`Creating zone in category ${categoryId}: ${JSON.stringify(createZoneDto)}`);

    // Check if the category exists
    const { data: category, error: categoryError } = await this.databaseService.adminClient
      .from('categories')
      .select(`
        *,
        resource_scopes (id, scope_type, guild_id, alliance_id, group_id)
      `)
      .eq('id', categoryId)
      .single();

    if (categoryError) {
      this.logger.error(`Error getting category: ${categoryError.message}`);
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    // Debug: Ausgabe der Kategorie-Struktur
    this.logger.debug(`Kategorie: ${JSON.stringify(category)}`);
    this.logger.debug(`Resource Scopes: ${JSON.stringify(category.resource_scopes)}`);


    // Check if zone key is unique within the category
    const { data: existingZones, error: zonesError } = await this.databaseService.adminClient
      .from('zones')
      .select('zone_key')
      .eq('category_id', categoryId)
      .eq('zone_key', createZoneDto.zoneKey);

    if (zonesError) {
      this.logger.error(`Error checking zone key uniqueness: ${zonesError.message}`);
      throw new Error(`Error checking zone key uniqueness: ${zonesError.message}`);
    }

    if (existingZones.length > 0) {
      throw new Error(`Zone key '${createZoneDto.zoneKey}' already exists in this category`);
    }

    // Create Discord voice channel if the category has a Discord category
    let discordChannelId: string | null = null;
    if (category.discord_category_id && !category.setup_flow_enabled) {
      try {
        // Konvertiere die Guild-UUID in die Discord-ID
        // Bei Supabase-Joins kommt resource_scopes als Array zurück
        const resourceScope = Array.isArray(category.resource_scopes) ? category.resource_scopes[0] : category.resource_scopes;
        const guildId = resourceScope?.guild_id || '';
        this.logger.debug(`Guild-ID aus resource_scopes: ${guildId}`);

        if (!guildId) {
          throw new Error('Keine Guild-ID in der Kategorie gefunden');
        }

        const discordGuildId = await this.guildService.getDiscordGuildIdByUuid(guildId);

        // Only create a Discord channel if setup is not enabled
        const channel = await this.discordApiService.createVoiceChannel(
          discordGuildId, // Verwende die Discord-ID statt der UUID
          `[${createZoneDto.zoneKey}] ${createZoneDto.name}`,
          category.discord_category_id,
        );

        if (channel) {
          discordChannelId = channel.id;
        } else {
          this.logger.warn(`Failed to create Discord voice channel for zone ${createZoneDto.name}`);
        }
      } catch (error) {
        this.logger.error(`Error converting guild UUID to Discord ID: ${error.message}`);
        // Wir werfen hier keinen Fehler, damit die Zone trotzdem erstellt wird
      }
    }

    // Create the zone in the database
    const { data: zone, error: zoneError } = await this.databaseService.adminClient
      .from('zones')
      .insert({
        category_id: categoryId,
        name: createZoneDto.name,
        zone_key: createZoneDto.zoneKey,
        points_per_interval: createZoneDto.pointsPerInterval,
        interval_minutes: createZoneDto.intervalMinutes,
        discord_channel_id: discordChannelId,
      })
      .select()
      .single();

    if (zoneError) {
      this.logger.error(`Error creating zone: ${zoneError.message}`);
      throw new Error(`Error creating zone: ${zoneError.message}`);
    }

    return this.mapZoneToDto(zone);
  }

  /**
   * Get all zones for a category
   */
  async getZonesByCategory(categoryId: string): Promise<ZoneDto[]> {
    this.logger.log(`Getting zones for category: ${categoryId}`);

    const { data: zones, error } = await this.databaseService.adminClient
      .from('zones')
      .select('*')
      .eq('category_id', categoryId);

    if (error) {
      this.logger.error(`Error getting zones: ${error.message}`);
      throw new Error(`Error getting zones: ${error.message}`);
    }

    return zones.map(zone => this.mapZoneToDto(zone));
  }

  /**
   * Get a zone by ID
   */
  async getZoneById(zoneId: string): Promise<ZoneDto> {
    this.logger.log(`Getting zone by ID: ${zoneId}`);

    const { data: zone, error } = await this.databaseService.adminClient
      .from('zones')
      .select('*')
      .eq('id', zoneId)
      .single();

    if (error) {
      this.logger.error(`Error getting zone: ${error.message}`);
      throw new NotFoundException(`Zone with ID ${zoneId} not found`);
    }

    return this.mapZoneToDto(zone);
  }

  /**
   * Update a zone
   */
  async updateZone(zoneId: string, updateZoneDto: UpdateZoneDto): Promise<ZoneDto> {
    this.logger.log(`Updating zone ${zoneId}: ${JSON.stringify(updateZoneDto)}`);

    // Get the current zone
    const { data: zone, error: zoneError } = await this.databaseService.adminClient
      .from('zones')
      .select('*')
      .eq('id', zoneId)
      .single();

    if (zoneError) {
      this.logger.error(`Error getting zone: ${zoneError.message}`);
      throw new NotFoundException(`Zone with ID ${zoneId} not found`);
    }

    // Check if zone key is unique within the category if it's being changed
    if (updateZoneDto.zoneKey && updateZoneDto.zoneKey !== zone.zone_key) {
      const { data: existingZones, error: zonesError } = await this.databaseService.adminClient
        .from('zones')
        .select('zone_key')
        .eq('category_id', zone.category_id)
        .eq('zone_key', updateZoneDto.zoneKey);

      if (zonesError) {
        this.logger.error(`Error checking zone key uniqueness: ${zonesError.message}`);
        throw new Error(`Error checking zone key uniqueness: ${zonesError.message}`);
      }

      if (existingZones.length > 0) {
        throw new Error(`Zone key '${updateZoneDto.zoneKey}' already exists in this category`);
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (updateZoneDto.name !== undefined) updateData.name = updateZoneDto.name;
    if (updateZoneDto.zoneKey !== undefined) updateData.zone_key = updateZoneDto.zoneKey;
    if (updateZoneDto.pointsPerInterval !== undefined) updateData.points_per_interval = updateZoneDto.pointsPerInterval;
    if (updateZoneDto.intervalMinutes !== undefined) updateData.interval_minutes = updateZoneDto.intervalMinutes;

    // Update Discord voice channel if it exists - Verwende BullMQ für Namensänderungen
    if (zone.discord_channel_id && (updateZoneDto.name || updateZoneDto.zoneKey)) {
      // Hole die zugehörige Kategorie, um zu prüfen, ob setupFlowEnabled = false ist
      const { data: category, error: categoryError } = await this.databaseService.adminClient
        .from('categories')
        .select('setup_flow_enabled')
        .eq('id', zone.category_id)
        .single();

      if (categoryError) {
        this.logger.error(`Error getting category for zone ${zoneId}: ${categoryError.message}`);
        throw new NotFoundException(`Category for zone ${zoneId} not found`);
      } else {
        const setupFlowEnabled = category?.setup_flow_enabled ?? true;

        if (!setupFlowEnabled) {
          // Nur fortfahren, wenn Setup NICHT aktiv ist
          const newName = updateZoneDto.name ?? zone.name; // Nimm neuen oder alten Namen
          const newKey = updateZoneDto.zoneKey ?? zone.zone_key; // Nimm neuen oder alten Key
          const formattedName = `[${newKey}] ${newName}`;
          const channelId = zone.discord_channel_id;

          try {
            // 1. Letzten Namen in Redis speichern
            this.logger.debug(`Setting last known name for ${channelId} in Redis to "${formattedName}"`);
            await this.redis.hset('pending_channel_names', { [channelId]: formattedName });

            // 2. Job hinzufügen, WENN noch keiner läuft/wartet
            const jobId = `process-channel-${channelId}`;
            const existingJob = await this.channelRenameQueue.getJob(jobId);
            if (!existingJob || ['completed', 'failed'].includes(await existingJob.getState())) {
               this.logger.log(`Adding zone channel rename job to queue: ${jobId}`);
               await this.channelRenameQueue.add('process-rename', { channelId }, { jobId });
            } else {
                this.logger.log(`Job ${jobId} already active or waiting for channel ${channelId}. Redis name updated. Skipping add.`);
            }
          } catch (error) {
             this.logger.error(`Error setting Redis state or adding job for zone ${zoneId}: ${error.message}`);
             throw error;
          }
        } else {
          this.logger.log(`Skipping channel rename job for zone ${zoneId} because setup flow is enabled for the category`);
        }
      }
    }

    // Update zone in database
    const { data: updatedZone, error: updateError } = await this.databaseService.adminClient
      .from('zones')
      .update(updateData)
      .eq('id', zoneId)
      .select()
      .single();

    if (updateError) {
      this.logger.error(`Error updating zone: ${updateError.message}`);
      throw new Error(`Error updating zone: ${updateError.message}`);
    }

    return this.mapZoneToDto(updatedZone);
  }

  /**
   * Delete a zone
   */
  async deleteZone(zoneId: string): Promise<boolean> {
    this.logger.log(`Deleting zone: ${zoneId}`);

    // Get the zone to delete
    const { data: zone, error: zoneError } = await this.databaseService.adminClient
      .from('zones')
      .select('*')
      .eq('id', zoneId)
      .single();

    if (zoneError) {
      this.logger.error(`Error getting zone: ${zoneError.message}`);
      throw new NotFoundException(`Zone with ID ${zoneId} not found`);
    }

    // Delete Discord voice channel if it exists
    if (zone.discord_channel_id) {
      await this.discordApiService.deleteChannel(zone.discord_channel_id);
    }

    // Delete the zone
    const { error: deleteError } = await this.databaseService.adminClient
      .from('zones')
      .delete()
      .eq('id', zoneId);

    if (deleteError) {
      this.logger.error(`Error deleting zone: ${deleteError.message}`);
      throw new Error(`Error deleting zone: ${deleteError.message}`);
    }

    return true;
  }

  /**
   * Helper method to map a zone from the database to a DTO
   */
  private mapZoneToDto(zone: any): ZoneDto {
    return {
      id: zone.id,
      categoryId: zone.category_id,
      name: zone.name,
      zoneKey: zone.zone_key,
      pointsPerInterval: zone.points_per_interval,
      intervalMinutes: zone.interval_minutes,
      discordChannelId: zone.discord_channel_id,
      createdAt: zone.created_at,
      updatedAt: zone.updated_at,
    };
  }
}
