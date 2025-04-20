import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '../../database';
// AuthModule nicht mehr importieren, da es global ist
// import { AuthModule } from '../auth';

@Module({
  imports: [DatabaseModule], // AuthModule nicht mehr importieren, da es global ist
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
