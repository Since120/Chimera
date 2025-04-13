import { Module } from '@nestjs/common';
import { ConfigModule } from '../config';
import { DatabaseModule } from '../database';
import { AuthModule } from './auth';
import { UsersModule } from './users';
import { GuildsModule } from './guilds';
import { BotGatewayModule } from './bot-gateway';
import { GuildModule } from './guild';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    GuildsModule,
    BotGatewayModule,
    GuildModule,
  ],
  exports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    GuildsModule,
    BotGatewayModule,
    GuildModule,
  ],
})
export class CoreModule {}
