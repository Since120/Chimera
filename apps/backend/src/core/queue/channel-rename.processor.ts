// apps\backend\src\core\queue\channel-rename.processor.ts
import { Processor, WorkerHost, /* BackoffOptions */ } from '@nestjs/bullmq'; // BackoffOptions ggf. importieren
import { Logger, Injectable, NotFoundException, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { DiscordApiService } from '../../discord/discord-api/discord-api.service';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

interface ChannelRenameJobData {
  channelId: string;
}

@Injectable()
@Processor('channel-rename')
export class ChannelRenameProcessor extends WorkerHost {
  private readonly logger = new Logger(ChannelRenameProcessor.name);

  // Upstash Ratelimiter nur für eine initiale Optimierung, nicht als Haupt-Logik
  private readonly initialRateLimiter: Ratelimit;

  constructor(
    private readonly discordApiService: DiscordApiService,
    @Inject('UPSTASH_REDIS_CLIENT') private readonly redis: Redis,
  ) {
    super();
    this.initialRateLimiter = new Ratelimit({
      redis: this.redis,
      limiter: Ratelimit.slidingWindow(2, "600s"), // 2 Anfragen pro 10 Minuten
      prefix: "ratelimit:channel_rename:initial_check", // Anderer Prefix, um den State nicht zu vermischen
    });
  }

  async process(job: Job<ChannelRenameJobData>): Promise<void> {
    const { channelId } = job.data;
    this.logger.log(`[Job ${job.id} | Attempt ${job.attemptsMade + 1}/${job.opts.attempts}] Processing rename for channel ${channelId}`);

    let latestName: string | null = null;
    try {
      // Schritt 1: Letzten Namen aus Redis holen
      latestName = await this.redis.hget('pending_channel_names', channelId);

      if (!latestName) {
        this.logger.warn(`[Job ${job.id}] No target name found in Redis for channel ${channelId}. Assuming completed or stale. Skipping.`);
        await job.remove(); // Job entfernen, da er sinnlos ist
        return;
      }
      this.logger.debug(`[Job ${job.id}] Target name from Redis: "${latestName}"`);

      // Schritt 2: OPTIONALER initialer Upstash Check (nur beim ERSTEN Versuch)
      // Verhindert unnötige API Calls, wenn wir *sicher* wissen, dass das Limit kürzlich aktiv war.
      if (job.attemptsMade === 0) { // Nur beim ersten Versuch prüfen
        const { success } = await this.initialRateLimiter.limit(channelId);
        if (!success) {
          this.logger.warn(`[Job ${job.id}] Initial Upstash check failed. Assuming recent rate limit. Job will fail and retry via BullMQ backoff.`);
           // Wichtig: trotzdem den Fehler werfen, damit BullMQ den Backoff startet
          throw new HttpException(`Initial rate limit check failed`, HttpStatus.TOO_MANY_REQUESTS);
        }
         this.logger.debug(`[Job ${job.id}] Initial rate limit check successful.`);
      } else {
         this.logger.debug(`[Job ${job.id}] Skipping initial Upstash check on attempt ${job.attemptsMade + 1}. Relying on BullMQ backoff.`);
      }


      // Schritt 3: Discord API aufrufen (Hauptlogik!)
      this.logger.debug(`[Job ${job.id}] Attempting Discord API call to rename to "${latestName}"...`);
      await this.discordApiService.renameChannelOrCategory(channelId, latestName);
      this.logger.log(`[Job ${job.id}] Successfully renamed channel ${channelId} to "${latestName}"`);

      // Bei Erfolg: Namen aus Redis löschen, damit dieser Job nicht erneut (fälschlicherweise) getriggert wird
      // und um anzuzeigen, dass der Zustand in Discord jetzt dem in Redis entspricht.
      try {
          this.logger.debug(`[Job ${job.id}] Removing name from Redis after successful rename.`);
          await this.redis.hdel('pending_channel_names', channelId);
      } catch(e) {
          this.logger.error(`[Job ${job.id}] Failed to delete name from Redis after success`, e);
      }


    } catch (error) {
      this.logger.error(`[Job ${job.id}] Failed during attempt ${job.attemptsMade + 1}. Error: ${error.message}`);

      if (error instanceof NotFoundException || (error instanceof HttpException && error.getStatus() === HttpStatus.FORBIDDEN)) {
        // Kanal nicht gefunden oder keine Rechte - Job soll endgültig fehlschlagen
        this.logger.warn(`[Job ${job.id}] Channel not found or forbidden (403/404). Removing from Redis and failing job permanently.`);
        if (latestName) { // Nur löschen, wenn wir einen Namen hatten
           try { await this.redis.hdel('pending_channel_names', channelId); } catch (e) { this.logger.error("Failed to delete stale name from Redis", e); }
        }
        // Fehler weiterwerfen, damit BullMQ ihn als failed markiert (nach allen Attempts)
        throw error;

      } else if (error instanceof HttpException && error.getStatus() === HttpStatus.TOO_MANY_REQUESTS) {
        // Rate Limit von Discord API oder vom initialen Check
        this.logger.warn(`[Job ${job.id}] Rate Limit (429) caught. BullMQ will handle retry with backoff.`);

        // Optional: Manuelles Hinzufügen mit spezifischer Verzögerung basierend auf retry_after,
        // falls der Standard-Backoff von BullMQ nicht ausreicht. ABER der Standard sollte gut sein.
        // const retryAfter = (error as any).retryAfter ?? (job.opts.backoff as BackoffOptions)?.delay / 1000 ?? 10;
        // this.logger.warn(`Discord suggested retry after ${retryAfter} seconds.`);
        // Hier KEINEN Job manuell hinzufügen. Einfach den Fehler werfen.

        throw error; // Fehler weiterwerfen für BullMQ Backoff

      } else {
        // Anderer Fehler (Netzwerk etc.)
        this.logger.error(`[Job ${job.id}] Unhandled error. Job will retry via BullMQ backoff. Stack: ${error.stack}`);
        // Fehler weiterwerfen für BullMQ Backoff
        throw error;
      }
    }
  }
}