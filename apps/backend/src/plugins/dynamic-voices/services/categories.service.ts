import { Injectable, Logger, NotFoundException, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { DiscordApiService } from '../../../discord/discord-api/discord-api.service';
import { GuildService } from '../../../core/guild/services/guild.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Redis } from '@upstash/redis';
import {
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  ScopeType,
  CategoryDiscordRolePermissionDto
} from 'shared-types';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly discordApiService: DiscordApiService,
    private readonly guildService: GuildService,
    @InjectQueue('channel-rename') private readonly channelRenameQueue: Queue,
    @Inject('UPSTASH_REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  /**
   * Create a new category
   */
  async createCategory(createCategoryDto: CreateCategoryDto): Promise<CategoryDto> {
    this.logger.log(`Creating category: ${JSON.stringify(createCategoryDto)}`);

    // First, create the resource scope
    const { data: resourceScope, error: resourceScopeError } = await this.databaseService.adminClient
      .from('resource_scopes')
      .insert({
        scope_type: createCategoryDto.scope.scopeType,
        guild_id: createCategoryDto.scope.scopeType === ScopeType.GUILD ? createCategoryDto.scope.scopeId : null,
        alliance_id: createCategoryDto.scope.scopeType === ScopeType.ALLIANCE ? createCategoryDto.scope.scopeId : null,
        group_id: createCategoryDto.scope.scopeType === ScopeType.GROUP ? createCategoryDto.scope.scopeId : null,
      })
      .select()
      .single();

    if (resourceScopeError) {
      this.logger.error(`Error creating resource scope: ${resourceScopeError.message}`);
      throw new Error(`Error creating resource scope: ${resourceScopeError.message}`);
    }

    // Create the Discord category if it's a guild scope
    let discordCategoryId: string | null = null;
    if (createCategoryDto.scope.scopeType === ScopeType.GUILD) {
      try {
        // Konvertiere die Guild-UUID in die Discord-ID
        const discordGuildId = await this.guildService.getDiscordGuildIdByUuid(createCategoryDto.scope.scopeId);

        const rolePermissions = createCategoryDto.discordRoleIds.map(roleId => ({
          roleId,
          canView: createCategoryDto.isVisibleDefault,
          canConnect: true,
        }));

        const category = await this.discordApiService.createCategoryChannel(
          discordGuildId, // Verwende die Discord-ID statt der UUID
          createCategoryDto.name,
          rolePermissions,
        );

        if (category) {
          discordCategoryId = category.id as string;
        } else {
          this.logger.warn(`Failed to create Discord category for ${createCategoryDto.name}`);
        }
      } catch (error) {
        this.logger.error(`Error converting guild UUID to Discord ID: ${error.message}`);
        // Wir werfen hier keinen Fehler, damit die Kategorie trotzdem erstellt wird
      }
    }

    // Create the category in the database
    const { data: category, error: categoryError } = await this.databaseService.adminClient
      .from('categories')
      .insert({
        resource_scope_id: resourceScope.id,
        name: createCategoryDto.name,
        discord_category_id: discordCategoryId,
        is_visible_default: createCategoryDto.isVisibleDefault,
        default_tracking_enabled: createCategoryDto.defaultTrackingEnabled,
        setup_flow_enabled: createCategoryDto.setupFlowEnabled,
        warteraum_channel_id: null, // Will be created later if setup is enabled
        setup_channel_id: null, // Will be created later if setup is enabled
      })
      .select()
      .single();

    if (categoryError) {
      this.logger.error(`Error creating category: ${categoryError.message}`);
      throw new Error(`Error creating category: ${categoryError.message}`);
    }

    // Create role permissions - auch wenn keine Discord-Kategorie erstellt werden konnte
    if (createCategoryDto.discordRoleIds && createCategoryDto.discordRoleIds.length > 0) {
      const rolePermissions = createCategoryDto.discordRoleIds.map(roleId => ({
        category_id: category.id,
        discord_role_id: roleId,
        can_view: createCategoryDto.isVisibleDefault,
        can_connect: true,
      }));

      this.logger.debug(`Attempting to insert role permissions: ${JSON.stringify(rolePermissions)}`);
      const { error: permissionsError } = await this.databaseService.adminClient
        .from('category_discord_role_permissions')
        .insert(rolePermissions);

      if (permissionsError) {
        this.logger.error('Error creating role permissions:', permissionsError);
        // WICHTIG: Fehler werfen!
        throw new HttpException(`Fehler beim Speichern der Rollenberechtigungen: ${permissionsError.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        this.logger.log(`Successfully inserted role permissions for category ${category.id}`);
      }
    } else {
      this.logger.warn(`Keine Rollenberechtigungen für Kategorie ${category.id} angegeben.`);
    }

    // Create setup channels if setup is enabled
    if (createCategoryDto.setupFlowEnabled && discordCategoryId) {
      try {
        // Konvertiere die Guild-UUID in die Discord-ID
        const discordGuildId = await this.guildService.getDiscordGuildIdByUuid(createCategoryDto.scope.scopeId);

        // Create warteraum (waiting room) channel
        const warteraumName = createCategoryDto.warteraumChannelName || 'warteraum';
        const warteraum = await this.discordApiService.createVoiceChannel(
          discordGuildId, // Verwende die Discord-ID statt der UUID
          warteraumName,
          discordCategoryId,
        );

        // Create setup text channel
        const setupChannelName = createCategoryDto.setupChannelName || 'setup';
        const setupChannel = await this.discordApiService.createTextChannel(
          discordGuildId, // Verwende die Discord-ID statt der UUID
          setupChannelName,
          discordCategoryId,
        );

      // Update category with channel IDs
      if (warteraum || setupChannel) {
        const { error: updateError } = await this.databaseService.adminClient
          .from('categories')
          .update({
            warteraum_channel_id: warteraum?.id || null,
            setup_channel_id: setupChannel?.id || null,
          })
          .eq('id', category.id);

        if (updateError) {
          this.logger.error(`Error updating category with setup channels: ${updateError.message}`);
        }
      }
      } catch (error) {
        this.logger.error(`Error creating setup channels: ${error.message}`);
        // Wir werfen hier keinen Fehler, damit die Kategorie trotzdem erstellt wird
      }
    }

    // Return the created category with its scope
    return this.mapCategoryToDto(category, resourceScope);
  }

  /**
   * Get all categories for a specific scope
   */
  async getCategoriesByScope(scopeType: ScopeType, scopeId: string): Promise<CategoryDto[]> {
    this.logger.log(`Getting categories for scope: ${scopeType} ${scopeId}`);

    // First, get the resource scope
    const { data: resourceScopes, error: resourceScopeError } = await this.databaseService.adminClient
      .from('resource_scopes')
      .select('id')
      .eq('scope_type', scopeType)
      .eq(
        scopeType === ScopeType.GUILD ? 'guild_id' :
        scopeType === ScopeType.ALLIANCE ? 'alliance_id' : 'group_id',
        scopeId
      );

    if (resourceScopeError) {
      this.logger.error(`Error getting resource scopes: ${resourceScopeError.message}`);
      throw new Error(`Error getting resource scopes: ${resourceScopeError.message}`);
    }

    if (!resourceScopes.length) {
      return [];
    }

    const resourceScopeIds = resourceScopes.map(scope => scope.id);

    // Get categories for these resource scopes
    const { data: categories, error: categoriesError } = await this.databaseService.adminClient
      .from('categories')
      .select(`
        *,
        resource_scopes (
          id,
          scope_type,
          guild_id,
          alliance_id,
          group_id
        )
      `)
      .in('resource_scope_id', resourceScopeIds);

    if (categoriesError) {
      this.logger.error(`Error getting categories: ${categoriesError.message}`);
      throw new Error(`Error getting categories: ${categoriesError.message}`);
    }

    // Get role permissions for these categories
    const categoryIds = categories.map(category => category.id);
    const { data: rolePermissions, error: permissionsError } = await this.databaseService.adminClient
      .from('category_discord_role_permissions')
      .select('*')
      .in('category_id', categoryIds);

    if (permissionsError) {
      this.logger.error(`Error getting role permissions: ${permissionsError.message}`);
    }

    // Map permissions to categories
    const permissionsByCategory = {};
    if (rolePermissions) {
      rolePermissions.forEach(permission => {
        if (!permissionsByCategory[permission.category_id]) {
          permissionsByCategory[permission.category_id] = [];
        }
        permissionsByCategory[permission.category_id].push(permission.discord_role_id);
      });
    }

    // Map categories to DTOs
    return categories.map(category => {
      const dto = this.mapCategoryToDto(category, category.resource_scopes);
      dto.allowedRoles = permissionsByCategory[category.id] || [];
      return dto;
    });
  }

  /**
   * Get a category by ID
   */
  async getCategoryById(categoryId: string): Promise<CategoryDto> {
    this.logger.log(`Getting category by ID: ${categoryId}`);

    const { data: category, error: categoryError } = await this.databaseService.adminClient
      .from('categories')
      .select(`
        *,
        resource_scopes (
          id,
          scope_type,
          guild_id,
          alliance_id,
          group_id
        )
      `)
      .eq('id', categoryId)
      .single();

    if (categoryError) {
      this.logger.error(`Error getting category: ${categoryError.message}`);
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    // Get role permissions
    const { data: rolePermissions, error: permissionsError } = await this.databaseService.adminClient
      .from('category_discord_role_permissions')
      .select('*')
      .eq('category_id', categoryId);

    if (permissionsError) {
      this.logger.error(`Error getting role permissions: ${permissionsError.message}`);
    }

    // Map category to DTO
    const dto = this.mapCategoryToDto(category, category.resource_scopes);
    dto.allowedRoles = rolePermissions?.map(permission => permission.discord_role_id) || [];
    return dto;
  }

  /**
   * Update a category
   */
  async updateCategory(categoryId: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryDto> {
    this.logger.log(`Updating category ${categoryId}: ${JSON.stringify(updateCategoryDto)}`);

    // Get the current category
    const { data: category, error: categoryError } = await this.databaseService.adminClient
      .from('categories')
      .select(`
        *,
        resource_scopes (
          id,
          scope_type,
          guild_id,
          alliance_id,
          group_id
        )
      `)
      .eq('id', categoryId)
      .single();

    if (categoryError) {
      this.logger.error(`Error getting category: ${categoryError.message}`);
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    // Prepare update data
    const updateData: any = {};
    if (updateCategoryDto.name !== undefined) updateData.name = updateCategoryDto.name;
    if (updateCategoryDto.isVisibleDefault !== undefined) updateData.is_visible_default = updateCategoryDto.isVisibleDefault;
    if (updateCategoryDto.defaultTrackingEnabled !== undefined) updateData.default_tracking_enabled = updateCategoryDto.defaultTrackingEnabled;
    if (updateCategoryDto.setupFlowEnabled !== undefined) updateData.setup_flow_enabled = updateCategoryDto.setupFlowEnabled;

    // Update Discord category if it exists - Verwende BullMQ für Namensänderungen
    if (category.discord_category_id && updateCategoryDto.name) {
      try {
        const rolePermissions = updateCategoryDto.discordRoleIds?.map(roleId => ({
          roleId,
          canView: updateCategoryDto.isVisibleDefault ?? category.is_visible_default,
          canConnect: true,
        }));

        // Nur die Berechtigungen direkt aktualisieren, nicht den Namen
        if (rolePermissions && rolePermissions.length > 0) {
          await this.discordApiService.updateCategoryChannel(
            category.discord_category_id,
            {
              rolePermissions,
            },
          );
        }

        const newName = updateCategoryDto.name; // Bereits geprüft, dass Name da ist
        const channelId = category.discord_category_id;

        // 1. Letzten Namen in Redis speichern (überschreibt alten)
        this.logger.debug(`Setting last known name for ${channelId} in Redis to "${newName}"`);
        await this.redis.hset('pending_channel_names', { [channelId]: newName });

        // 2. Job hinzufügen, WENN noch keiner läuft/wartet
        const jobId = `process-channel-${channelId}`;
        const existingJob = await this.channelRenameQueue.getJob(jobId);
        // Prüft ob Job existiert UND ob er nicht schon fertig/fehlgeschlagen ist
        if (!existingJob || ['completed', 'failed'].includes(await existingJob.getState())) {
           this.logger.log(`Adding channel rename job to queue: ${jobId}`);
           // Nur die ID übergeben, der Name wird aus Redis geholt
           await this.channelRenameQueue.add('process-rename', { channelId }, { jobId });
        } else {
            this.logger.log(`Job ${jobId} already active or waiting for channel ${channelId}. Redis name updated. Skipping add.`);
        }
        // KEINE direkten Discord Calls mehr hier (weder Name noch Permissions)
      } catch (error) {
        this.logger.error(`Error updating Discord category: ${error.message}`);
        // Fehler weiterwerfen, um die gesamte Kategorie-Aktualisierung zu stoppen
        throw error;
      }
    }

    // Update category in database
    const { error: updateError } = await this.databaseService.adminClient
      .from('categories')
      .update(updateData)
      .eq('id', categoryId)
      .select()
      .single();

    if (updateError) {
      this.logger.error(`Error updating category: ${updateError.message}`);
      throw new Error(`Error updating category: ${updateError.message}`);
    }

    // Update role permissions if provided
    if (updateCategoryDto.discordRoleIds) {
      // First, delete existing permissions
      const { error: deleteError } = await this.databaseService.adminClient
        .from('category_discord_role_permissions')
        .delete()
        .eq('category_id', categoryId);

      if (deleteError) {
        this.logger.error('Error deleting existing role permissions:', deleteError);
        throw new HttpException(`Fehler beim Löschen der bestehenden Rollenberechtigungen: ${deleteError.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Then, insert new permissions
      const rolePermissions = updateCategoryDto.discordRoleIds.map(roleId => ({
        category_id: categoryId,
        discord_role_id: roleId,
        can_view: updateCategoryDto.isVisibleDefault ?? category.is_visible_default,
        can_connect: true,
      }));

      if (rolePermissions.length > 0) {
        this.logger.debug(`Attempting to insert role permissions: ${JSON.stringify(rolePermissions)}`);
        const { error: permissionsError } = await this.databaseService.adminClient
          .from('category_discord_role_permissions')
          .insert(rolePermissions);

        if (permissionsError) {
          this.logger.error('Error updating role permissions:', permissionsError);
          // WICHTIG: Fehler werfen!
          throw new HttpException(`Fehler beim Speichern der Rollenberechtigungen: ${permissionsError.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          this.logger.log(`Successfully inserted role permissions for category ${categoryId}`);
        }
      }
    }

    // Return the updated category
    return this.getCategoryById(categoryId);
  }

  /**
   * Delete a category
   */
  async deleteCategory(categoryId: string): Promise<boolean> {
    this.logger.log(`Deleting category: ${categoryId}`);

    // Check if the category has zones
    const { data: zones, error: zonesError } = await this.databaseService.adminClient
      .from('zones')
      .select('id')
      .eq('category_id', categoryId);

    if (zonesError) {
      this.logger.error(`Error checking zones: ${zonesError.message}`);
      throw new Error(`Error checking zones: ${zonesError.message}`);
    }

    if (zones.length > 0) {
      throw new Error('Cannot delete category with existing zones. Delete all zones first.');
    }

    // Get the category to delete
    const { data: category, error: categoryError } = await this.databaseService.adminClient
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (categoryError) {
      this.logger.error(`Error getting category: ${categoryError.message}`);
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    // Delete Discord category if it exists
    if (category.discord_category_id) {
      await this.discordApiService.deleteChannel(category.discord_category_id);
    }

    // Delete setup channels if they exist
    if (category.warteraum_channel_id) {
      await this.discordApiService.deleteChannel(category.warteraum_channel_id);
    }
    if (category.setup_channel_id) {
      await this.discordApiService.deleteChannel(category.setup_channel_id);
    }

    // Delete role permissions
    const { error: permissionsError } = await this.databaseService.adminClient
      .from('category_discord_role_permissions')
      .delete()
      .eq('category_id', categoryId);

    if (permissionsError) {
      this.logger.error('Error deleting role permissions:', permissionsError);
      throw new HttpException(`Fehler beim Löschen der Rollenberechtigungen: ${permissionsError.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    } else {
      this.logger.log(`Successfully deleted role permissions for category ${categoryId}`);
    }

    // Delete the category
    const { error: deleteError } = await this.databaseService.adminClient
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (deleteError) {
      this.logger.error(`Error deleting category: ${deleteError.message}`);
      throw new Error(`Error deleting category: ${deleteError.message}`);
    }

    // Delete the resource scope
    const { error: resourceScopeError } = await this.databaseService.adminClient
      .from('resource_scopes')
      .delete()
      .eq('id', category.resource_scope_id);

    if (resourceScopeError) {
      this.logger.error(`Error deleting resource scope: ${resourceScopeError.message}`);
    }

    return true;
  }

  /**
   * Get category role permissions
   */
  async getCategoryRolePermissions(categoryId: string): Promise<CategoryDiscordRolePermissionDto[]> {
    this.logger.log(`Getting role permissions for category: ${categoryId}`);

    const { data: permissions, error } = await this.databaseService.adminClient
      .from('category_discord_role_permissions')
      .select('*')
      .eq('category_id', categoryId);

    if (error) {
      this.logger.error(`Error getting role permissions: ${error.message}`);
      throw new Error(`Error getting role permissions: ${error.message}`);
    }

    return permissions.map(permission => ({
      categoryId: permission.category_id,
      discordRoleId: permission.discord_role_id,
      canView: permission.can_view,
      canConnect: permission.can_connect,
    }));
  }

  /**
   * Helper method to map a category from the database to a DTO
   */
  private mapCategoryToDto(category: any, resourceScope: any): CategoryDto {
    return {
      id: category.id,
      scope: {
        id: resourceScope.id,
        scopeType: resourceScope.scope_type,
        scopeId: resourceScope.scope_type === ScopeType.GUILD
          ? resourceScope.guild_id
          : resourceScope.scope_type === ScopeType.ALLIANCE
            ? resourceScope.alliance_id
            : resourceScope.group_id,
      },
      name: category.name,
      discordCategoryId: category.discord_category_id,
      isVisibleDefault: category.is_visible_default,
      defaultTrackingEnabled: category.default_tracking_enabled,
      setupFlowEnabled: category.setup_flow_enabled,
      warteraumChannelId: category.warteraum_channel_id,
      setupChannelId: category.setup_channel_id,
      createdAt: category.created_at,
      updatedAt: category.updated_at,
      allowedRoles: [], // Will be filled later
    };
  }
}
