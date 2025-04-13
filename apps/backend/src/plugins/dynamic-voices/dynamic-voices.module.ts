import { Module } from '@nestjs/common';
import { CategoriesService } from './services/categories.service';
import { ZonesService } from './services/zones.service';
import { TwoWaySyncService } from './services/two-way-sync.service';
import { CategoriesController } from './controllers/categories.controller';
import { ZonesController } from './controllers/zones.controller';
import { DatabaseModule } from '../../database';
import { DiscordApiModule } from '../../discord/discord-api';
import { BotGatewayModule } from '../../core/bot-gateway';
import { GuildModule } from '../../core/guild/guild.module';

@Module({
  imports: [
    DatabaseModule,
    DiscordApiModule,
    BotGatewayModule,
    GuildModule,
  ],
  controllers: [
    CategoriesController,
    ZonesController,
  ],
  providers: [
    CategoriesService,
    ZonesService,
    TwoWaySyncService,
  ],
  exports: [
    CategoriesService,
    ZonesService,
    TwoWaySyncService,
  ],
})
export class DynamicVoicesModule {}
