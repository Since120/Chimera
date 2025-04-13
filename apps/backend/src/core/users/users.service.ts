import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database';
import { UpdateUserProfileDto, UserProfileDto } from 'shared-types';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Get a user profile by ID
   */
  async getUserById(id: string): Promise<UserProfileDto> {
    const { data, error } = await this.databaseService.adminClient
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return data as UserProfileDto;
  }

  /**
   * Get a user profile by Discord ID
   */
  async getUserByDiscordId(discordId: string): Promise<UserProfileDto> {
    const { data, error } = await this.databaseService.adminClient
      .from('user_profiles')
      .select('*')
      .eq('discord_id', discordId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`User with Discord ID ${discordId} not found`);
    }

    return data as UserProfileDto;
  }

  /**
   * Update a user profile
   */
  async updateUserProfile(
    userId: string,
    updateDto: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    // First check if user exists
    await this.getUserById(userId);

    // Update user profile
    const { data, error } = await this.databaseService.adminClient
      .from('user_profiles')
      .update({
        ...updateDto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }

    return data as UserProfileDto;
  }
}
