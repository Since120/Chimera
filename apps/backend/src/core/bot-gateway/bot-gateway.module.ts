import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotGatewayService } from './bot-gateway.service';
import { BotGatewayController } from './bot-gateway.controller';
import { DatabaseModule } from '../../database';
import { AuthModule } from '../auth';

@Module({
  imports: [DatabaseModule, AuthModule, ConfigModule],
  controllers: [BotGatewayController],
  providers: [BotGatewayService],
  exports: [BotGatewayService],
})
export class BotGatewayModule {}
