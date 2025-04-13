/**
 * DTO for zone information
 */
export interface ZoneDto {
  id: string;
  categoryId: string;
  name: string;
  zoneKey: string;
  pointsPerInterval: number;
  intervalMinutes: number;
  discordChannelId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a zone
 */
export interface CreateZoneDto {
  name: string;
  zoneKey: string;
  pointsPerInterval: number;
  intervalMinutes: number;
}

/**
 * DTO for updating a zone
 */
export interface UpdateZoneDto {
  name?: string;
  zoneKey?: string;
  pointsPerInterval?: number;
  intervalMinutes?: number;
}
