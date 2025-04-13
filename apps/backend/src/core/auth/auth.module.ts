import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
// import { DiscordStrategy } from './strategies/discord.strategy'; // Removed import
import { DatabaseModule } from '../../database';

@Module({
  imports: [
    // Register 'jwt-supabase' as the default strategy
    PassportModule.register({ defaultStrategy: 'jwt-supabase' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '1d'),
        },
      }),
    }),
    DatabaseModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // Removed DiscordStrategy
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
