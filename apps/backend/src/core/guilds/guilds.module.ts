import { Module, forwardRef } from '@nestjs/common';
import { GuildsService } from './guilds.service';
import { GuildsController } from './guilds.controller';
import { DatabaseModule } from '../../database';
import { AuthModule } from '../auth';
// Kein Import von JwtAuthGuard

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)], // Import wieder hinzufügen
  controllers: [GuildsController],
  providers: [GuildsService], // Kein JwtAuthGuard hier
  exports: [GuildsService],
})
export class GuildsModule {}
