import { GuildSelectionInfoDto } from './guild';

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
