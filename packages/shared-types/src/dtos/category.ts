import { ResourceScopeDto } from './resource-scope';

/**
 * DTO for category information
 */
export interface CategoryDto {
  id: string;
  scope: ResourceScopeDto;
  name: string;
  discordCategoryId?: string;
  isVisibleDefault: boolean;
  defaultTrackingEnabled: boolean;
  setupFlowEnabled: boolean;
  warteraumChannelId?: string;
  setupChannelId?: string;
  createdAt: string;
  updatedAt: string;
  allowedRoles?: string[]; // Discord role IDs that have access to this category
}

/**
 * DTO for creating a category
 */
export interface CreateCategoryDto {
  scope: ResourceScopeDto;
  name: string;
  discordRoleIds: string[];
  isVisibleDefault: boolean;
  defaultTrackingEnabled: boolean;
  setupFlowEnabled: boolean;
  warteraumChannelName?: string;
  setupChannelName?: string;
}

/**
 * DTO for updating a category
 */
export interface UpdateCategoryDto {
  name?: string;
  discordRoleIds?: string[];
  isVisibleDefault?: boolean;
  defaultTrackingEnabled?: boolean;
  setupFlowEnabled?: boolean;
  warteraumChannelName?: string;
  setupChannelName?: string;
}

/**
 * DTO for category discord role permissions
 */
export interface CategoryDiscordRolePermissionDto {
  categoryId: string;
  discordRoleId: string;
  canView: boolean;
  canConnect: boolean;
}
