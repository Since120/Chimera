import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BotGatewayService } from './bot-gateway.service';
import { JwtAuthGuard } from '../auth';

@Controller('bot-gateway')
@UseGuards(JwtAuthGuard)
export class BotGatewayController {
  constructor(private readonly botGatewayService: BotGatewayService) {}

  /**
   * Register a guild with the bot
   */
  @Post('register-guild')
  async registerGuild(
    @Body()
    guildData: {
      discord_id: string;
      name: string;
      icon_url?: string;
      owner_id: string;
    },
  ) {
    return this.botGatewayService.registerGuild(guildData);
  }

  /**
   * Register a guild member
   */
  @Post('register-guild-member')
  async registerGuildMember(
    @Body()
    memberData: {
      guild_id: string;
      discord_id: string;
      username: string;
      avatar_url?: string;
      discord_roles: string[];
    },
  ) {
    return this.botGatewayService.registerGuildMember(memberData);
  }

  /**
   * Update bot status for a guild
   */
  @Post('update-bot-status')
  async updateBotStatus(
    @Body() data: { guild_id: string; is_present: boolean },
  ) {
    return this.botGatewayService.updateBotStatus(
      data.guild_id,
      data.is_present,
    );
  }
}
