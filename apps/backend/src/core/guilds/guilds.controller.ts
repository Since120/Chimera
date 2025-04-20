import { Controller, Get, Param, Req } from '@nestjs/common';
import { GuildsService } from './guilds.service';

@Controller('guilds')
export class GuildsController {
  constructor(private readonly guildsService: GuildsService) {}

  /**
   * Get all guilds available to the current user
   */
  @Get()
  async getUserGuilds(@Req() req) {
    return this.guildsService.getUserGuilds(req.user.id);
  }

  /**
   * Get a guild by ID
   * Only returns the guild if the user is a member
   */
  @Get(':id')
  async getGuildById(@Req() req, @Param('id') id: string) {
    // Check if user is a member of the guild
    const isMember = await this.guildsService.isUserMemberOfGuild(
      req.user.id,
      id,
    );

    if (!isMember) {
      return { error: 'You are not a member of this guild' };
    }

    return this.guildsService.getGuildById(id);
  }

  /**
   * Get the current user's membership in a guild
   */
  @Get(':id/membership')
  async getUserGuildMembership(@Req() req, @Param('id') id: string) {
    return this.guildsService.getUserGuildMembership(req.user.id, id);
  }
}
