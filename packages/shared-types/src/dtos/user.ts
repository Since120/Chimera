/**
 * DTO for user profile information
 */
export interface UserProfileDto {
  id: string;
  username: string;
  avatar_url?: string;
  discord_id: string;
  global_tracking_disabled: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * DTO for updating user profile
 */
export interface UpdateUserProfileDto {
  global_tracking_disabled?: boolean;
}
