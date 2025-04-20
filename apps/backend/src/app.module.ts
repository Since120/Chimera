import { Module, forwardRef } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core';
import { DynamicVoicesModule } from './plugins/dynamic-voices';
import { DiscordApiModule } from './discord/discord-api';
import { QueueModule } from './core/queue/queue.module';
import { LoggerModule } from './core/logger/logger.module';

@Module({
  imports: [
    forwardRef(() => CoreModule),
    forwardRef(() => DiscordApiModule),
    forwardRef(() => DynamicVoicesModule),
    forwardRef(() => QueueModule),
    forwardRef(() => LoggerModule),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
