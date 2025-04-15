import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotGatewayService } from './bot-gateway.service';
import { BotGatewayController } from './bot-gateway.controller';
import { DatabaseModule } from '../../database';
import { AuthModule } from '../auth';
import { DynamicVoicesModule } from '../../plugins/dynamic-voices/dynamic-voices.module';

@Module({
  imports: [DatabaseModule, AuthModule, ConfigModule, forwardRef(() => DynamicVoicesModule)],
  controllers: [BotGatewayController],
  providers: [BotGatewayService],
  exports: [BotGatewayService],
})
export class BotGatewayModule {}
