/**
 * DTO for representing a single permission definition
 */
export interface PermissionDto {
  id: number; // Database ID
  permissionKey: string; // e.g., 'category:create'
  description?: string | null;
  module?: string | null;
}

/**
 * DTO for assigning/revoking a permission to/from a Discord role (API Payload)
 */
export interface AssignPermissionToDiscordRoleDto {
  discordRoleId: string;
  permissionKey: string;
}

/**
 * DTO for assigning/revoking a permission to/from a User (API Payload)
 */
export interface AssignPermissionToUserDto {
  userId: string; // user_profile.id (UUID)
  permissionKey: string;
}

/**
 * DTO representing permission assignments for Discord roles (API Response)
 */
export interface GuildDiscordRolePermissionAssignmentDto {
  discordRoleId: string;
  discordRoleName: string; // Helpful for UI
  assignedPermissionKeys: string[];
}

/**
 * DTO representing permission assignments for Users (API Response)
 */
export interface GuildUserPermissionAssignmentDto {
  userId: string; // user_profile.id (UUID)
  username: string; // Helpful for UI
  assignedPermissionKeys: string[];
}
