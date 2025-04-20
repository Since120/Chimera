// apps\backend\src\core\queue\queue.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChannelRenameProcessor } from './channel-rename.processor';
import { DiscordApiModule } from '../../discord/discord-api';
import { Redis } from '@upstash/redis';

const QUEUE_NAME = 'channel-rename';

@Module({
  imports: [
    forwardRef(() => DiscordApiModule),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: QUEUE_NAME,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: { count: 1000 }, // Behalte fehlgeschlagene Jobs für die Analyse
        // Erhöhe Attempts für mehr Sicherheit (optional, aber empfohlen)
        attempts: 7,
        backoff: {
          type: 'exponential',
          // !! Erhöhe den initialen Delay signifikant !!
          delay: 90000,       // Beginne mit 90 Sekunden (1.5 Minuten) Verzögerung
          /*
           * Geschätzte Retry-Zeiten nach dem ersten Fehler:
           * Versuch 2: nach  90s   (1.5 min)
           * Versuch 3: nach 180s   (3.0 min) -> Gesamt:  4.5 min
           * Versuch 4: nach 360s   (6.0 min) -> Gesamt: 10.5 min --> HIER sollte es klappen!
           * Versuch 5: nach 720s  (12.0 min) -> Gesamt: 22.5 min (Puffer)
           * Versuch 6: nach 1440s (24.0 min) -> Gesamt: 46.5 min (Sehr großer Puffer)
           * Versuch 7: nach 2880s (48.0 min) -> Gesamt: 94.5 min (Extremer Puffer)
           */
        },
      },
    }),
  ],
  providers: [
    ChannelRenameProcessor,
    // Upstash Redis Client Provider
    {
      provide: 'UPSTASH_REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('UPSTASH_REDIS_URL');
        const redisToken = configService.get<string>('UPSTASH_REDIS_TOKEN');
        if (!redisUrl || !redisToken) {
          throw new Error('Upstash Redis URL oder Token fehlen in der Konfiguration!');
        }
        return new Redis({
          url: redisUrl,
          token: redisToken,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [BullModule, 'UPSTASH_REDIS_CLIENT'],
})
export class QueueModule {}