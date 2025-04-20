import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '../config';
import { DatabaseModule } from '../database';
import { AuthModule } from './auth';
import { UsersModule } from './users';
import { GuildsModule } from './guilds';
import { BotGatewayModule } from './bot-gateway';
import { GuildModule } from './guild';
import { PermissionsModule } from './permissions';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    forwardRef(() => GuildsModule),
    forwardRef(() => BotGatewayModule),
    forwardRef(() => GuildModule),
    forwardRef(() => PermissionsModule),
  ],
  exports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    GuildsModule,
    BotGatewayModule,
    GuildModule,
    PermissionsModule,
  ],
})
export class CoreModule {}
