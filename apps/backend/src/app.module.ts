import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core';
import { DynamicVoicesModule } from './plugins/dynamic-voices';
import { DiscordApiModule } from './discord/discord-api';

@Module({
  imports: [
    CoreModule,
    DiscordApiModule,
    DynamicVoicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
