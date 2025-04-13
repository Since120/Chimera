import { Module } from '@nestjs/common';
import { DiscordApiService } from './discord-api.service';
import { BotGatewayModule } from '../../core/bot-gateway';

@Module({
  imports: [BotGatewayModule],
  providers: [DiscordApiService],
  exports: [DiscordApiService],
})
export class DiscordApiModule {}
