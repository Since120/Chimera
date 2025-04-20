import { Controller, Get, Param, Logger, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { GuildService } from '../services/guild.service';
// JwtAuthGuard wird global registriert
import { BotGatewayService } from '../../bot-gateway/bot-gateway.service';

@Controller('guilds')
export class GuildController {
  private readonly logger = new Logger(GuildController.name);

  constructor(
    private readonly guildService: GuildService,
    @Inject(forwardRef(() => BotGatewayService))
    private readonly botGatewayService: BotGatewayService,
  ) {}

  @Get(':id/roles')
  async getGuildRoles(@Param('id') guildUuid: string) {
    try {
      // Zuerst die Discord-Guild-ID aus der Datenbank abrufen
      const discordGuildId = await this.guildService.getDiscordGuildIdByUuid(guildUuid);

      const client = this.botGatewayService.getClient();
      const guild = client.guilds.cache.get(discordGuildId);

      if (!guild) {
        throw new HttpException(`Discord-Guild mit ID ${discordGuildId} nicht gefunden`, HttpStatus.NOT_FOUND);
      }

      const roles = guild.roles.cache
        .filter(role => !role.managed && role.name !== '@everyone')
        .sort((a, b) => b.position - a.position)
        .map(role => ({
          id: role.id,
          name: role.name,
          color: role.color,
          colorHex: role.hexColor,
          position: role.position,
        }));

      return roles;
    } catch (error) {
      this.logger.error(`Error getting guild roles: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Error getting guild roles',
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
