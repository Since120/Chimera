import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database';
import { Client, GatewayIntentBits, Events } from 'discord.js';

@Injectable()
export class BotGatewayService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BotGatewayService.name);
  private client: Client;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {
    // Initialisieren des Discord-Clients mit den notwendigen Intents
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
      ],
    });

    // Event-Handler registrieren
    this.setupEventHandlers();
  }

  /**
   * Wird aufgerufen, wenn das Modul initialisiert wird
   */
  async onModuleInit() {
    try {
      // Bot-Token aus der Konfiguration holen
      const token = this.configService.get<string>('DISCORD_BOT_TOKEN');
      if (!token) {
        this.logger.error('DISCORD_BOT_TOKEN ist nicht konfiguriert');
        return;
      }

      // Bei Discord anmelden
      await this.client.login(token);
      this.logger.log(`Bot erfolgreich angemeldet als ${this.client.user?.tag}`);

      // Alle aktuellen Server des Bots registrieren
      await this.registerAllGuilds();
    } catch (error) {
      this.logger.error(`Fehler beim Anmelden des Bots: ${error.message}`);
    }
  }

  /**
   * Wird aufgerufen, wenn das Modul zerstört wird
   */
  async onModuleDestroy() {
    // Bot abmelden
    this.client.destroy();
    this.logger.log('Bot abgemeldet');
  }

  /**
   * Event-Handler für den Discord-Client einrichten
   */
  private setupEventHandlers() {
    // Ready-Event
    this.client.on(Events.ClientReady, () => {
      this.logger.log(`Bot ist bereit: ${this.client.user?.tag}`);
    });

    // Guild-Create-Event (Bot tritt einem Server bei)
    this.client.on(Events.GuildCreate, async (guild) => {
      try {
        this.logger.log(`Bot ist dem Server beigetreten: ${guild.name} (${guild.id})`);

        // Prüfen, ob die Guild bereits in der Datenbank existiert
        const { data: existingGuild, error: findError } = await this.databaseService.adminClient
          .from('guilds')
          .select('id')
          .eq('discord_id', guild.id)
          .single();

        let guildId: string;

        if (findError && findError.code !== 'PGRST116') { // Fehler, aber nicht "keine Zeile gefunden"
          this.logger.error(`Fehler beim Suchen der Guild: ${findError.message}`);
          return;
        }

        if (existingGuild) {
          // Guild existiert bereits, aktualisiere den Status
          guildId = existingGuild.id;
          this.logger.log(`Guild existiert bereits mit ID ${guildId}, aktualisiere Status...`);
          await this.updateBotStatus(guildId, true);
        } else {
          // Guild existiert noch nicht, registriere sie
          const result = await this.registerGuild({
            discord_id: guild.id,
            name: guild.name,
            icon_url: guild.iconURL() || undefined,
            owner_id: guild.ownerId,
          });
          guildId = result.id;
        }

        // Guild-Mitglieder abrufen und registrieren
        const members = await guild.members.fetch();
        for (const [, member] of members) {
          if (member.user.bot) continue; // Bots überspringen

          await this.registerGuildMember({
            guild_id: guildId, // Verwende die UUID aus der Datenbank
            discord_id: member.id,
            username: member.user.username,
            avatar_url: member.user.avatarURL() || undefined,
            discord_roles: member.roles.cache.map(role => role.id),
          });
        }
      } catch (error) {
        this.logger.error(`Fehler beim Verarbeiten des GuildCreate-Events: ${error.message}`);
      }
    });

    // Guild-Delete-Event (Bot verlässt einen Server oder wird entfernt)
    this.client.on(Events.GuildDelete, async (guild) => {
      try {
        this.logger.log(`Bot hat den Server verlassen: ${guild.name} (${guild.id})`);

        // Guild in der Datenbank als inaktiv markieren
        const { data: guildData, error } = await this.databaseService.adminClient
          .from('guilds')
          .select('id')
          .eq('discord_id', guild.id)
          .single();

        if (error) {
          this.logger.error(`Fehler beim Suchen der Guild: ${error.message}`);
          return;
        }

        // Bot-Status und bot_present auf inaktiv/false setzen
        await this.updateBotStatus(guildData.id, false);
      } catch (error) {
        this.logger.error(`Fehler beim Verarbeiten des GuildDelete-Events: ${error.message}`);
      }
    });

    // GuildMemberAdd-Event (Neues Mitglied tritt dem Server bei)
    this.client.on(Events.GuildMemberAdd, async (member) => {
      try {
        if (member.user.bot) return; // Bots überspringen

        this.logger.log(`Neues Mitglied auf dem Server: ${member.user.username} (${member.id})`);

        // Guild in der Datenbank suchen
        const { data: guildData, error } = await this.databaseService.adminClient
          .from('guilds')
          .select('id')
          .eq('discord_id', member.guild.id)
          .single();

        if (error) {
          this.logger.error(`Fehler beim Suchen der Guild: ${error.message}`);
          return;
        }

        // Mitglied in der Datenbank registrieren
        await this.registerGuildMember({
          guild_id: guildData.id,
          discord_id: member.id,
          username: member.user.username,
          avatar_url: member.user.avatarURL() || undefined,
          discord_roles: member.roles.cache.map(role => role.id),
        });
      } catch (error) {
        this.logger.error(`Fehler beim Verarbeiten des GuildMemberAdd-Events: ${error.message}`);
      }
    });

    // GuildMemberRemove-Event (Mitglied verlässt den Server oder wird entfernt)
    this.client.on(Events.GuildMemberRemove, async (member) => {
      try {
        if (member.user.bot) return; // Bots überspringen

        this.logger.log(`Mitglied hat den Server verlassen: ${member.user.username} (${member.id})`);

        // Mitglied in der Datenbank als inaktiv markieren
        const { data: userData, error: userError } = await this.databaseService.adminClient
          .from('user_profiles')
          .select('id')
          .eq('discord_id', member.id)
          .single();

        if (userError) {
          this.logger.error(`Fehler beim Suchen des Users: ${userError.message}`);
          return;
        }

        const { data: guildData, error: guildError } = await this.databaseService.adminClient
          .from('guilds')
          .select('id')
          .eq('discord_id', member.guild.id)
          .single();

        if (guildError) {
          this.logger.error(`Fehler beim Suchen der Guild: ${guildError.message}`);
          return;
        }

        // Mitgliedschaft in der Datenbank löschen oder als inaktiv markieren
        const { error: deleteError } = await this.databaseService.adminClient
          .from('guild_members')
          .delete()
          .eq('user_id', userData.id)
          .eq('guild_id', guildData.id);

        if (deleteError) {
          this.logger.error(`Fehler beim Löschen der Mitgliedschaft: ${deleteError.message}`);
        }
      } catch (error) {
        this.logger.error(`Fehler beim Verarbeiten des GuildMemberRemove-Events: ${error.message}`);
      }
    });

    // GuildMemberUpdate-Event (Mitglied wird aktualisiert, z.B. Rollen ändern sich)
    this.client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
      try {
        if (newMember.user.bot) return; // Bots überspringen

        // Prüfen, ob sich die Rollen geändert haben
        const oldRoles = oldMember.roles.cache.map(role => role.id);
        const newRoles = newMember.roles.cache.map(role => role.id);

        // Wenn sich die Rollen nicht geändert haben, nichts tun
        if (JSON.stringify(oldRoles.sort()) === JSON.stringify(newRoles.sort())) {
          return;
        }

        this.logger.log(`Mitglied wurde aktualisiert: ${newMember.user.username} (${newMember.id})`);

        // User und Guild in der Datenbank suchen
        const { data: userData, error: userError } = await this.databaseService.adminClient
          .from('user_profiles')
          .select('id')
          .eq('discord_id', newMember.id)
          .single();

        if (userError) {
          this.logger.error(`Fehler beim Suchen des Users: ${userError.message}`);
          return;
        }

        const { data: guildData, error: guildError } = await this.databaseService.adminClient
          .from('guilds')
          .select('id')
          .eq('discord_id', newMember.guild.id)
          .single();

        if (guildError) {
          this.logger.error(`Fehler beim Suchen der Guild: ${guildError.message}`);
          return;
        }

        // Mitgliedschaft in der Datenbank aktualisieren
        const { error: updateError } = await this.databaseService.adminClient
          .from('guild_members')
          .update({
            discord_roles: newRoles,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userData.id)
          .eq('guild_id', guildData.id);

        if (updateError) {
          this.logger.error(`Fehler beim Aktualisieren der Mitgliedschaft: ${updateError.message}`);
        }
      } catch (error) {
        this.logger.error(`Fehler beim Verarbeiten des GuildMemberUpdate-Events: ${error.message}`);
      }
    });
  }

  /**
   * Register a guild with the bot
   */
  async registerGuild(guildData: {
    discord_id: string;
    name: string;
    icon_url?: string;
    owner_id: string; // Dies ist die Discord-ID des Besitzers
  }) {
    this.logger.log(`Registering guild: ${guildData.name} (${guildData.discord_id})`);

    // Check if guild already exists
    const { data: existingGuild, error: findError } = await this.databaseService.adminClient
      .from('guilds')
      .select('id')
      .eq('discord_id', guildData.discord_id)
      .single();

    if (findError && findError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw new Error(`Error finding guild: ${findError.message}`);
    }

    if (existingGuild) {
      // Update existing guild
      const { error: updateError } = await this.databaseService.adminClient
        .from('guilds')
        .update({
          name: guildData.name,
          icon_url: guildData.icon_url,
          owner_discord_id: guildData.owner_id, // Verwende owner_discord_id statt owner_id
          bot_status: 'active', // Setze den Bot-Status auf aktiv
          bot_present: true, // Setze bot_present auf true
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingGuild.id);

      if (updateError) {
        throw new Error(`Error updating guild: ${updateError.message}`);
      }

      return { id: existingGuild.id, isNew: false };
    } else {
      // Create new guild
      const { data: newGuild, error: createError } = await this.databaseService.adminClient
        .from('guilds')
        .insert({
          discord_id: guildData.discord_id,
          name: guildData.name,
          icon_url: guildData.icon_url,
          owner_discord_id: guildData.owner_id, // Verwende owner_discord_id statt owner_id
          bot_status: 'active', // Setze den Bot-Status auf aktiv
          bot_present: true, // Setze bot_present auf true
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Error creating guild: ${createError.message}`);
      }

      return { id: newGuild.id, isNew: true };
    }
  }

  /**
   * Register a guild member
   */
  async registerGuildMember(memberData: {
    guild_id: string;
    discord_id: string;
    username: string;
    avatar_url?: string;
    discord_roles: string[];
  }) {
    this.logger.log(`Registering guild member: ${memberData.username} in guild ${memberData.guild_id}`);

    // First, ensure user exists
    const { data: user, error: userError } = await this.databaseService.adminClient
      .from('user_profiles')
      .select('id')
      .eq('discord_id', memberData.discord_id)
      .single();

    let userId: string;

    if (userError && userError.code === 'PGRST116') { // User doesn't exist
      // Create new user
      const { data: newUser, error: createUserError } = await this.databaseService.adminClient
        .from('user_profiles')
        .insert({
          discord_id: memberData.discord_id,
          username: memberData.username,
          avatar_url: memberData.avatar_url,
          global_tracking_disabled: false,
        })
        .select()
        .single();

      if (createUserError) {
        throw new Error(`Error creating user: ${createUserError.message}`);
      }

      userId = newUser.id;
    } else if (userError) {
      throw new Error(`Error finding user: ${userError.message}`);
    } else {
      userId = user.id;
    }

    // Now check if guild membership exists
    const { data: existingMember, error: findMemberError } = await this.databaseService.adminClient
      .from('guild_members')
      .select('id')
      .eq('user_id', userId)
      .eq('guild_id', memberData.guild_id)
      .single();

    if (findMemberError && findMemberError.code !== 'PGRST116') {
      throw new Error(`Error finding guild member: ${findMemberError.message}`);
    }

    if (existingMember) {
      // Update existing membership
      const { error: updateError } = await this.databaseService.adminClient
        .from('guild_members')
        .update({
          discord_roles: memberData.discord_roles,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingMember.id);

      if (updateError) {
        throw new Error(`Error updating guild member: ${updateError.message}`);
      }

      return { id: existingMember.id, isNew: false };
    } else {
      // Create new membership
      const { data: newMember, error: createError } = await this.databaseService.adminClient
        .from('guild_members')
        .insert({
          user_id: userId,
          guild_id: memberData.guild_id,
          discord_roles: memberData.discord_roles,
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Error creating guild member: ${createError.message}`);
      }

      return { id: newMember.id, isNew: true };
    }
  }

  /**
   * Registriert alle aktuellen Server des Bots in der Datenbank
   */
  async registerAllGuilds() {
    try {
      this.logger.log('Registriere alle aktuellen Server des Bots...');

      // Warten, bis der Client bereit ist
      if (!this.client.isReady()) {
        this.logger.log('Client ist noch nicht bereit, warte auf ready-Event...');
        await new Promise<void>((resolve) => {
          const readyHandler = () => {
            this.client.removeListener(Events.ClientReady, readyHandler);
            resolve();
          };
          this.client.on(Events.ClientReady, readyHandler);
        });
      }

      // Alle Server abrufen
      const guilds = this.client.guilds.cache;
      this.logger.log(`Bot ist auf ${guilds.size} Servern aktiv.`);

      // Jeden Server registrieren
      for (const [, guild] of guilds) {
        try {
          this.logger.log(`Registriere Server: ${guild.name} (${guild.id})`);

          // Prüfen, ob die Guild bereits in der Datenbank existiert
          const { data: existingGuild, error: findError } = await this.databaseService.adminClient
            .from('guilds')
            .select('id')
            .eq('discord_id', guild.id)
            .single();

          let guildId: string;

          if (findError && findError.code !== 'PGRST116') { // Fehler, aber nicht "keine Zeile gefunden"
            this.logger.error(`Fehler beim Suchen der Guild: ${findError.message}`);
            continue;
          }

          if (existingGuild) {
            // Guild existiert bereits, aktualisiere den Status
            guildId = existingGuild.id;
            this.logger.log(`Guild existiert bereits mit ID ${guildId}, aktualisiere Status...`);
            await this.updateBotStatus(guildId, true);
            this.logger.log(`Server ${guild.name} aktualisiert mit ID ${guildId}`);
          } else {
            // Guild existiert noch nicht, registriere sie
            const result = await this.registerGuild({
              discord_id: guild.id,
              name: guild.name,
              icon_url: guild.iconURL() || undefined,
              owner_id: guild.ownerId,
            });
            guildId = result.id;
            this.logger.log(`Server ${guild.name} neu erstellt mit ID ${guildId}`);
          }

          // Guild-Mitglieder abrufen und registrieren
          const members = await guild.members.fetch();
          this.logger.log(`Server ${guild.name} hat ${members.size} Mitglieder.`);

          let registeredMembers = 0;
          for (const [, member] of members) {
            if (member.user.bot) continue; // Bots überspringen

            try {
              await this.registerGuildMember({
                guild_id: guildId, // Verwende die UUID aus der Datenbank
                discord_id: member.id,
                username: member.user.username,
                avatar_url: member.user.avatarURL() || undefined,
                discord_roles: member.roles.cache.map(role => role.id),
              });
              registeredMembers++;
            } catch (memberError) {
              this.logger.error(`Fehler beim Registrieren des Mitglieds ${member.user.username}: ${memberError.message}`);
            }
          }

          this.logger.log(`${registeredMembers} Mitglieder für Server ${guild.name} registriert.`);
        } catch (guildError) {
          this.logger.error(`Fehler beim Registrieren des Servers ${guild.name}: ${guildError.message}`);
        }
      }

      this.logger.log('Registrierung aller Server abgeschlossen.');
    } catch (error) {
      this.logger.error(`Fehler beim Registrieren aller Server: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update bot status for a guild
   */
  async updateBotStatus(guildId: string, isActive: boolean) { // Parameter renamed for clarity
    const newStatus = isActive ? 'active' : 'inactive'; // Determine status based on boolean
    this.logger.log(`Updating bot status for guild ${guildId} to: ${newStatus}`);

    const { error } = await this.databaseService.adminClient
      .from('guilds')
      .update({
        bot_status: newStatus, // Use bot_status here with ENUM value
        bot_present: isActive, // Aktualisiere auch bot_present
        updated_at: new Date().toISOString(),
      })
      .eq('id', guildId);

    if (error) {
      throw new Error(`Error updating bot status: ${error.message}`);
    }

    return { success: true };
  }

  /**
   * Get the Discord client instance
   * @returns The Discord client
   */
  getClient() {
    return this.client;
  }
}
