import { Module, forwardRef } from '@nestjs/common';
import { GuildController } from './controllers/guild.controller';
import { GuildService } from './services/guild.service';
import { DatabaseModule } from '../../database';
import { BotGatewayModule } from '../bot-gateway';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => BotGatewayModule),
  ],
  controllers: [GuildController],
  providers: [GuildService],
  exports: [GuildService],
})
export class GuildModule {}
