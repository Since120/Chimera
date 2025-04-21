/**
 * DTO for user profile information
 */
export interface UserProfileDto {
  id: string;
  username: string;
  avatar_url?: string;
  discord_id: string;
  global_tracking_disabled: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * DTO for guild selection in the UI
 */
export interface GuildSelectionInfoDto {
  id: string;
  discord_id: string;
  name: string;
  icon_url?: string;
  is_admin: boolean; // Bleibt vorerst, kann später durch Permissions ersetzt werden
  permissions: string[]; // Effektive Permissions des Users für diese Guild
}

/**
 * DTO for session information
 */
export interface SessionDto {
  user: {
    id: string;
    username: string;
    avatar_url?: string;
    discord_id: string;
    global_tracking_disabled: boolean;
  };
  availableGuilds: GuildSelectionInfoDto[];
  token: string | null; // Allow token to be null
}

// Simplified User type for the auth context
export type User = Omit<UserProfileDto, 'created_at' | 'updated_at'>;
