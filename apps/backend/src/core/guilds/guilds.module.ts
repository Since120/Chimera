import { Module } from '@nestjs/common';
import { GuildsService } from './guilds.service';
import { GuildsController } from './guilds.controller';
import { DatabaseModule } from '../../database';
import { AuthModule } from '../auth';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [GuildsController],
  providers: [GuildsService],
  exports: [GuildsService],
})
export class GuildsModule {}
