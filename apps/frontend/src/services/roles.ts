import api from './api';

/**
 * Interface for Discord role information
 */
export interface DiscordRole {
  id: string;
  name: string;
  color: number;
  colorHex?: string;
  position: number;
}

/**
 * Get all Discord roles for a guild
 */
export const getGuildRoles = async (guildId: string): Promise<DiscordRole[]> => {
  const response = await api.get(`/guilds/${guildId}/roles`);
  return response.data;
};
