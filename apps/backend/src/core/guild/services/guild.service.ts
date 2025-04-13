import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

@Injectable()
export class GuildService {
  private readonly logger = new Logger(GuildService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Holt die Discord-Guild-ID aus der Datenbank anhand der UUID
   * @param uuid Die UUID der Guild in der Datenbank
   * @returns Die Discord-Guild-ID
   */
  async getDiscordGuildIdByUuid(uuid: string): Promise<string> {
    this.logger.log(`Suche Discord-Guild-ID für UUID: ${uuid}`);

    const { data, error } = await this.databaseService.adminClient
      .from('guilds')
      .select('discord_id')
      .eq('id', uuid)
      .single();

    if (error || !data) {
      this.logger.error(`Fehler beim Abrufen der Discord-Guild-ID: ${error?.message || 'Guild nicht gefunden'}`);
      throw new NotFoundException(`Guild mit UUID ${uuid} nicht gefunden`);
    }

    this.logger.log(`Discord-Guild-ID gefunden: ${data.discord_id}`);
    return data.discord_id;
  }
}
