import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core'; // APP_GUARD importieren
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
// import { DiscordStrategy } from './strategies/discord.strategy'; // Removed import
import { DatabaseModule } from '../../database';
import { PermissionsModule } from '../permissions'; // Import wieder hinzufügen
import { GuildsModule } from '../guilds'; // Import wieder hinzufügen
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // Guard importieren

// Kein @Global() mehr
@Module({
  imports: [
    // Register 'jwt-supabase' as the default strategy
    PassportModule.register({ defaultStrategy: 'jwt-supabase' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('SUPABASE_JWT_SECRET'), // Sicherstellen, dass hier der Supabase Secret verwendet wird
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '1d'),
        },
      }),
    }),
    DatabaseModule,
    PermissionsModule, // Normaler Import
    GuildsModule, // Normaler Import
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard, // Muss weiterhin als Provider deklariert sein
    // Registriert JwtAuthGuard als globalen Guard über DI
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService, JwtStrategy, PassportModule], // Guard NICHT exportieren
})
export class AuthModule {}
