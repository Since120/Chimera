/**
 * Enum for resource scope types
 */
export enum ScopeType {
  GUILD = 'guild',
  ALLIANCE = 'alliance',
  GROUP = 'group'
}

/**
 * DTO for resource scope information
 */
export interface ResourceScopeDto {
  id: string;
  scopeType: ScopeType;
  scopeId: string;
}

/**
 * DTO for creating a resource scope
 */
export interface CreateResourceScopeDto {
  scopeType: ScopeType;
  scopeId: string;
}
