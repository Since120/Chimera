/**
 * DTO for guild information
 */
export interface GuildDto {
  id: string;
  discord_id: string;
  name: string;
  icon_url?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * DTO for guild member information
 */
export interface GuildMemberDto {
  id: string;
  guild_id: string;
  user_id: string;
  discord_roles: string[];
  created_at: string;
  updated_at: string;
}

/**
 * DTO for guild selection in the UI
 */
export interface GuildSelectionInfoDto {
  id: string;
  discord_id: string;
  name: string;
  icon_url?: string;
  is_admin: boolean;
}
