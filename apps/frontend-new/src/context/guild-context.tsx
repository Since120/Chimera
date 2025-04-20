+'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { GuildSelectionInfoDto } from '@/types/auth'; // Stelle sicher, dass der Typ importiert wird

interface GuildContextType {
  availableGuilds: GuildSelectionInfoDto[]; // Liste aus AuthContext
  selectedGuild: GuildSelectionInfoDto | null;
  setSelectedGuild: (guild: GuildSelectionInfoDto | null) => void;
  isLoading: boolean; // Um Ladezustand anzuzeigen, bis ausgewählt wurde
}

const GuildContext = createContext<GuildContextType | undefined>(undefined);

export const useGuild = (): GuildContextType => {
  const context = useContext(GuildContext);
  if (!context) {
    throw new Error('useGuild must be used within a GuildProvider');
  }
  return context;
};

interface GuildProviderProps {
  children: ReactNode;
}

export function GuildProvider({ children }: GuildProviderProps) {
  const { availableGuilds: authAvailableGuilds, loading: authLoading, isAuthenticated } = useAuth();
  const [selectedGuild, setSelectedGuildState] = useState<GuildSelectionInfoDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false); // Neuer State

  // Effekt NUR für die initiale Auswahl aus localStorage, wenn Auth bereit ist
  useEffect(() => {
    // Nur ausführen, wenn Auth nicht lädt, User authentifiziert ist, Guilds da sind UND die initiale Ladung noch nicht erfolgt ist
    if (!authLoading && isAuthenticated && authAvailableGuilds.length > 0 && !initialLoadDone) {
      console.log('[GuildContext InitialLoad Effect] Attempting to load from localStorage.');
      let guildToSet: GuildSelectionInfoDto | null = null;
      try {
         // Sicherstellen, dass wir im Browser sind (obwohl 'use client' das impliziert)
         if (typeof window !== 'undefined') {
            const storedGuildId = localStorage.getItem('selectedGuildId');
            console.log('[GuildContext InitialLoad Effect] Read from localStorage - storedGuildId:', storedGuildId);

            const foundGuild = authAvailableGuilds.find(g => g.id === storedGuildId);
            console.log('[GuildContext InitialLoad Effect] Searching for stored guild. Found:', foundGuild ? foundGuild.name : 'None');

            if (foundGuild) {
              guildToSet = foundGuild;
            } else {
              // Fallback: Erste Guild wählen
               guildToSet = authAvailableGuilds[0];
               console.log('[GuildContext InitialLoad Effect] No valid stored guild, using first available:', guildToSet?.name);
               // Speichere den Fallback nur, wenn wir ihn tatsächlich setzen
               if (guildToSet) {
                   localStorage.setItem('selectedGuildId', guildToSet.id);
               }
            }
         } else {
             console.warn('[GuildContext InitialLoad Effect] window object not available.');
             guildToSet = authAvailableGuilds[0]; // Fallback ohne localStorage
         }
      } catch(error) {
          console.error("[GuildContext InitialLoad Effect] Error accessing localStorage:", error);
          guildToSet = authAvailableGuilds[0]; // Fallback bei Fehler
          if(guildToSet) {
              localStorage.setItem('selectedGuildId', guildToSet.id); // Fallback speichern
          }
      }

      if (guildToSet) {
        setSelectedGuildState(guildToSet);
        console.log('[GuildContext InitialLoad Effect] Setting initial guild:', guildToSet.name);
      }
      setInitialLoadDone(true); // Markieren, dass die initiale Ladung erfolgt ist
      setIsLoading(false); // Ladezustand beenden
    } else if (!authLoading && (!isAuthenticated || authAvailableGuilds.length === 0)) {
       // Wenn Auth fertig, aber User nicht auth oder keine Guilds -> keine Auswahl möglich
       console.log('[GuildContext InitialLoad Effect] Auth finished, but no user/guilds. Clearing selection.');
       setSelectedGuildState(null);
       if (typeof window !== 'undefined') {
           localStorage.removeItem('selectedGuildId');
       }
       setInitialLoadDone(true); // Auch hier als erledigt markieren
       setIsLoading(false);
    } else if (authLoading) {
        console.log('[GuildContext InitialLoad Effect] Waiting for auth loading...');
        // Noch nicht bereit, nichts tun, isLoading bleibt true
        setIsLoading(true); // Sicherstellen, dass es true ist
    }

  }, [authLoading, isAuthenticated, authAvailableGuilds, initialLoadDone]); // initialLoadDone hinzugefügt

   // Separater Effekt, um auf spätere Änderungen der Guild-Liste zu reagieren (z.B. wenn User von Server gekickt wird)
   useEffect(() => {
        // Nur ausführen, wenn initiale Ladung erfolgt ist und sich verfügbare Guilds ändern
        if (initialLoadDone && selectedGuild) {
            const currentSelectionStillAvailable = authAvailableGuilds.some(g => g.id === selectedGuild.id);
            if (!currentSelectionStillAvailable) {
                console.warn('[GuildContext Update Effect] Previously selected guild is no longer available. Resetting selection.');
                // Wähle die erste verfügbare oder null
                const newSelection = authAvailableGuilds.length > 0 ? authAvailableGuilds[0] : null;
                setSelectedGuildState(newSelection);
                 if (newSelection) {
                    localStorage.setItem('selectedGuildId', newSelection.id);
                 } else {
                    localStorage.removeItem('selectedGuildId');
                 }
            }
        }
   }, [authAvailableGuilds, selectedGuild, initialLoadDone]) // Abhängigkeiten: verfügbare Guilds, aktuelle Auswahl, Initial-Lade-Status


  // Funktion zum Setzen der Guild (aktualisiert auch localStorage)
  const setSelectedGuild = (guild: GuildSelectionInfoDto | null) => {
    setSelectedGuildState(guild);
    if (guild) {
      console.log('[GuildContext setSelectedGuild] Setting localStorage item:', guild.id);
      localStorage.setItem('selectedGuildId', guild.id);
      console.log('[GuildContext] Guild selected:', guild.name);
    } else {
      console.log('[GuildContext setSelectedGuild] Removing localStorage item.');
      localStorage.removeItem('selectedGuildId');
      console.log('[GuildContext] Guild selection cleared.');
    }
  };

  const value = useMemo(() => ({
    availableGuilds: authAvailableGuilds,
    selectedGuild,
    setSelectedGuild,
    isLoading // Nur noch der eigene Ladezustand
  }), [authAvailableGuilds, selectedGuild, isLoading]);

  return <GuildContext.Provider value={value}>{children}</GuildContext.Provider>;
}
