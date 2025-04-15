import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { DiscordApiService } from './discord-api.service';
import { BotGatewayModule } from '../../core/bot-gateway';

@Module({
  imports: [forwardRef(() => BotGatewayModule), HttpModule, ConfigModule],
  providers: [DiscordApiService],
  exports: [DiscordApiService],
})
export class DiscordApiModule {}
