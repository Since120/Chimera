import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database';
import { PermissionsService } from './permissions.service';

@Injectable()
export class AccessControlService {
  private readonly logger = new Logger(AccessControlService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly permissionsService: PermissionsService,
  ) {}

  /**
   * Calculates the effective permission keys for a user within a specific guild.
   * Combines permissions directly assigned to the user and permissions inherited from their Discord roles.
   * @param userProfileId The UUID of the user profile.
   * @param guildId The UUID of the guild.
   * @returns A promise resolving to an array of unique permission key strings.
   */
  async calculateEffectivePermissions(userProfileId: string, guildId: string): Promise<string[]> {
    this.logger.debug(`Calculating effective permissions for user ${userProfileId} in guild ${guildId}`);
    const effectivePermissions = new Set<string>();

    try {
      // 1. Get direct user permissions
      const { data: directUserPermsData, error: directUserPermsError } = await this.databaseService.adminClient
        .from('guild_user_permissions')
        .select('permissions:permission_id (permission_key)') // Join mit permissions Tabelle
        .eq('user_profile_id', userProfileId)
        .eq('guild_id', guildId);

      if (directUserPermsError) {
        this.logger.error(`Error fetching direct user permissions for user ${userProfileId}: ${directUserPermsError.message}`);
        // Nicht abbrechen, vielleicht hat der User Rollen-Permissions
      } else if (directUserPermsData) {
        directUserPermsData.forEach(p => {
          // Korrektur: Verwende any-Type für die Supabase-Antwort
          const permissions = p.permissions as any;
          if (permissions && typeof permissions.permission_key === 'string') {
            effectivePermissions.add(permissions.permission_key);
          }
        });
        this.logger.debug(`Found ${effectivePermissions.size} direct permissions for user ${userProfileId}.`);
      }

      // 2. Get user's Discord roles in the guild via direct DB query
      let userRoles: string[] = [];
      try {
          const { data: memberData, error: memberError } = await this.databaseService.adminClient
              .from('guild_members')
              .select('discord_roles')
              .eq('user_id', userProfileId)
              .eq('guild_id', guildId)
              .maybeSingle(); // maybeSingle ist sicherer, falls kein Eintrag existiert

          if (memberError) {
              this.logger.error(`Error fetching guild member roles for user ${userProfileId} in guild ${guildId}: ${memberError.message}`);
              // Kein Fehler werfen, fahre ohne Rollen fort
          } else if (memberData?.discord_roles) {
              userRoles = memberData.discord_roles;
          } else {
              this.logger.debug(`No guild membership or roles found for user ${userProfileId} in guild ${guildId}`);
          }

        this.logger.debug(`User ${userProfileId} has roles: ${JSON.stringify(userRoles)} in guild ${guildId}`);

        if (userRoles && userRoles.length > 0) {
          // 3. Get permissions assigned to those Discord roles
          const { data: rolePermsData, error: rolePermsError } = await this.databaseService.adminClient
            .from('guild_discord_role_permissions')
            .select('permissions:permission_id (permission_key)') // Join mit permissions Tabelle
            .eq('guild_id', guildId)
            .in('discord_role_id', userRoles); // Prüfe alle Rollen des Users

          if (rolePermsError) {
            this.logger.error(`Error fetching role permissions for roles [${userRoles.join(', ')}]: ${rolePermsError.message}`);
          } else if (rolePermsData) {
            const initialSize = effectivePermissions.size;
            rolePermsData.forEach(p => {
              // Korrektur: Verwende any-Type für die Supabase-Antwort
              const permissions = p.permissions as any;
              if (permissions && typeof permissions.permission_key === 'string') {
                effectivePermissions.add(permissions.permission_key);
              }
            });
            this.logger.debug(`Added ${effectivePermissions.size - initialSize} permissions via roles.`);
          }
        }
      } catch (dbError) { // Fange generischen DB-Fehler
        this.logger.error(`Database error fetching member roles for user ${userProfileId} in guild ${guildId}: ${dbError.message}`);
        // Wenn der User kein Mitglied ist, hat er keine Rollen-Permissions
      }

      const permissionsArray = Array.from(effectivePermissions);
      this.logger.log(`Effective permissions calculated for user ${userProfileId} in guild ${guildId}: ${permissionsArray.length} permissions`);
      return permissionsArray;

    } catch (error) {
      this.logger.error(`Failed to calculate effective permissions for user ${userProfileId} in guild ${guildId}: ${error.message}`, error.stack);
      return []; // Im Fehlerfall leere Liste zurückgeben
    }
  }

  /**
   * Checks if a user can perform a specific action (permission) within a guild.
   * @param userProfileId The UUID of the user profile.
   * @param guildId The UUID of the guild.
   * @param requiredPermissionKey The permission key string to check for.
   * @returns A promise resolving to true if the user has the permission, false otherwise.
   */
  async canUserPerformAction(userProfileId: string, guildId: string, requiredPermissionKey: string): Promise<boolean> {
    this.logger.debug(`Checking permission '${requiredPermissionKey}' for user ${userProfileId} in guild ${guildId}`);
    try {
      // TODO: Super-Admin-Check hinzufügen (falls benötigt)
      // const userProfile = await this.usersService.getUserById(userProfileId); // Beispiel
      // if (userProfile?.is_super_admin) return true;

      const effectivePermissions = await this.calculateEffectivePermissions(userProfileId, guildId);
      const hasPermission = effectivePermissions.includes(requiredPermissionKey);
      this.logger.debug(`Permission check result for '${requiredPermissionKey}': ${hasPermission}`);
      return hasPermission;
    } catch (error) {
      this.logger.error(`Error during permission check for '${requiredPermissionKey}': ${error.message}`, error.stack);
      return false; // Im Fehlerfall Zugriff verweigern
    }
  }

  // --- Methoden zum Zuweisen/Entfernen (für späteres Admin-UI, jetzt Grundgerüst) ---

  async assignPermissionToDiscordRole(guildId: string, discordRoleId: string, permissionKey: string): Promise<void> {
    const permissionId = await this.permissionsService.findPermissionIdByKey(permissionKey);
    if (permissionId === null) {
      throw new NotFoundException(`Permission with key '${permissionKey}' not found.`);
    }
    this.logger.log(`Assigning permission ${permissionKey} (ID: ${permissionId}) to Discord role ${discordRoleId} in guild ${guildId}`);
    const { error } = await this.databaseService.adminClient
      .from('guild_discord_role_permissions')
      .upsert({ guild_id: guildId, discord_role_id: discordRoleId, permission_id: permissionId }); // upsert ist sicher

    if (error) {
      this.logger.error(`Error assigning permission ${permissionKey} to role ${discordRoleId}: ${error.message}`);
      throw new Error(`Database error assigning permission: ${error.message}`);
    }
  }

  async revokePermissionFromDiscordRole(guildId: string, discordRoleId: string, permissionKey: string): Promise<void> {
    const permissionId = await this.permissionsService.findPermissionIdByKey(permissionKey);
    if (permissionId === null) {
      // Wenn die Permission nicht existiert, können wir auch nichts löschen
      this.logger.warn(`Attempted to revoke non-existent permission '${permissionKey}' from role ${discordRoleId}. Skipping.`);
      return;
    }
    this.logger.log(`Revoking permission ${permissionKey} (ID: ${permissionId}) from Discord role ${discordRoleId} in guild ${guildId}`);
    const { error } = await this.databaseService.adminClient
      .from('guild_discord_role_permissions')
      .delete()
      .eq('guild_id', guildId)
      .eq('discord_role_id', discordRoleId)
      .eq('permission_id', permissionId);

    if (error) {
      this.logger.error(`Error revoking permission ${permissionKey} from role ${discordRoleId}: ${error.message}`);
      throw new Error(`Database error revoking permission: ${error.message}`);
    }
  }

  async assignPermissionToUser(guildId: string, userProfileId: string, permissionKey: string): Promise<void> {
    const permissionId = await this.permissionsService.findPermissionIdByKey(permissionKey);
    if (permissionId === null) {
      throw new NotFoundException(`Permission with key '${permissionKey}' not found.`);
    }
    this.logger.log(`Assigning permission ${permissionKey} (ID: ${permissionId}) to user ${userProfileId} in guild ${guildId}`);
    const { error } = await this.databaseService.adminClient
      .from('guild_user_permissions')
      .upsert({ guild_id: guildId, user_profile_id: userProfileId, permission_id: permissionId }); // upsert ist sicher

    if (error) {
      this.logger.error(`Error assigning permission ${permissionKey} to user ${userProfileId}: ${error.message}`);
      throw new Error(`Database error assigning permission: ${error.message}`);
    }
  }

  async revokePermissionFromUser(guildId: string, userProfileId: string, permissionKey: string): Promise<void> {
    const permissionId = await this.permissionsService.findPermissionIdByKey(permissionKey);
    if (permissionId === null) {
      // Wenn die Permission nicht existiert, können wir auch nichts löschen
      this.logger.warn(`Attempted to revoke non-existent permission '${permissionKey}' from user ${userProfileId}. Skipping.`);
      return;
    }
    this.logger.log(`Revoking permission ${permissionKey} (ID: ${permissionId}) from user ${userProfileId} in guild ${guildId}`);
    const { error } = await this.databaseService.adminClient
      .from('guild_user_permissions')
      .delete()
      .eq('guild_id', guildId)
      .eq('user_profile_id', userProfileId)
      .eq('permission_id', permissionId);

    if (error) {
      this.logger.error(`Error revoking permission ${permissionKey} from user ${userProfileId}: ${error.message}`);
      throw new Error(`Database error revoking permission: ${error.message}`);
    }
  }
}
