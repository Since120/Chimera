'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { GuildSelectionInfoDto } from 'shared-types';
import { useAuth } from './auth-context';

interface GuildContextType {
  availableGuilds: GuildSelectionInfoDto[]; // Kommt jetzt stabil aus AuthContext
  currentGuild: GuildSelectionInfoDto | null;
  setCurrentGuild: (guildId: string | null) => void; // Ist jetzt stabil
  loading: boolean; // Kommt aus AuthContext
}

const defaultContext: GuildContextType = {
  availableGuilds: [],
  currentGuild: null,
  setCurrentGuild: () => {},
  loading: true,
};

const GuildContext = createContext<GuildContextType>(defaultContext);

export const useGuild = () => useContext(GuildContext);

export function GuildProvider({ children }: { children: React.ReactNode }) {
  // availableGuilds und loading kommen stabil aus AuthContext
  const { availableGuilds, loading: authLoading, isAuthenticated } = useAuth();
  const [selectedGuild, setSelectedGuild] = useState<GuildSelectionInfoDto | null>(null);

  // Initialisierung / Wiederherstellung der Auswahl
  useEffect(() => {
    console.log('[GuildContext Effect] Running Init/Restore Effect. AuthLoading:', authLoading, 'IsAuth:', isAuthenticated);
    if (!authLoading && isAuthenticated) {
      const guildsToUse = availableGuilds || [];
      console.log('[GuildContext Effect] Guilds available:', guildsToUse.length);

      if (guildsToUse.length === 0) {
        if (selectedGuild !== null) {
            console.log('[GuildContext Effect] No guilds available, resetting selection.');
            setSelectedGuild(null);
            localStorage.removeItem('selectedGuildId');
        }
        return;
      }

      const storedGuildId = localStorage.getItem('selectedGuildId');
      let guildToSelect: GuildSelectionInfoDto | null = null;

      if (storedGuildId) {
        guildToSelect = guildsToUse.find(g => g.id === storedGuildId) ?? null;
        if (!guildToSelect) {
          console.warn(`[GuildContext Effect] Stored guildId ${storedGuildId} not found in available guilds.`);
          localStorage.removeItem('selectedGuildId');
        }
      }

      // Wenn keine gültige gespeicherte Guild, nimm die erste
      if (!guildToSelect && guildsToUse.length > 0) {
        guildToSelect = guildsToUse[0];
        console.log('[GuildContext Effect] Selecting first available guild:', guildToSelect.name);
         localStorage.setItem('selectedGuildId', guildToSelect.id); // Speichere die erste, wenn keine gespeichert war
      }

      // Nur updaten, wenn sich die Auswahl ändert
      if (selectedGuild?.id !== guildToSelect?.id) {
        console.log(`[GuildContext Effect] Setting selected guild to: ${guildToSelect?.name ?? 'null'}`);
        setSelectedGuild(guildToSelect);
      }

    } else if (!authLoading && !isAuthenticated) {
      // Wenn nicht mehr authentifiziert, Auswahl sicher zurücksetzen
      if (selectedGuild !== null) {
          console.log('[GuildContext Effect] Not authenticated, resetting selection.');
          setSelectedGuild(null);
          localStorage.removeItem('selectedGuildId');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, availableGuilds]); // Abhängig von Auth-Status und verfügbaren Guilds

  // Funktion zum Setzen der Guild - stabil dank useCallback & stabiler Abhängigkeiten
  const setCurrentGuildMemoized = useCallback((guildId: string | null) => {
    console.log(`[GuildContext] setCurrentGuild called with ID: ${guildId}`);
    const foundGuild = guildId ? availableGuilds.find(g => g.id === guildId) : null;

    if (guildId && !foundGuild) {
      console.error(`[GuildContext] Attempted to set non-available guild: ${guildId}`);
      console.log('[GuildContext] Available guilds for check:', availableGuilds);
      // Optional: Fehler anzeigen oder zur ersten Guild wechseln?
      return; // Verhindere das Setzen einer ungültigen Guild
    }

    // Nur updaten, wenn sich die ID ändert
    if (selectedGuild?.id !== foundGuild?.id) {
        setSelectedGuild(foundGuild ?? null);
        if (foundGuild) {
          localStorage.setItem('selectedGuildId', foundGuild.id);
          console.log(`[GuildContext] Guild set to: ${foundGuild.name}`);
        } else {
          localStorage.removeItem('selectedGuildId');
          console.log('[GuildContext] Guild selection cleared.');
        }
    } else {
        console.log(`[GuildContext] Guild ${guildId} is already selected.`);
    }
  }, [availableGuilds, selectedGuild?.id]); // Hängt von verfügbaren Guilds und der aktuellen ID ab

  // Kontextwert - stabil dank useMemo und stabilen Abhängigkeiten
  const contextValue = useMemo(() => {
    console.log('[GuildContext] Recalculating context value.');
    return {
      currentGuild: selectedGuild,
      availableGuilds: availableGuilds || [],
      setCurrentGuild: setCurrentGuildMemoized,
      loading: authLoading,
    };
  }, [selectedGuild, availableGuilds, setCurrentGuildMemoized, authLoading]);

  return (
    <GuildContext.Provider value={contextValue}>
      {children}
    </GuildContext.Provider>
  );
}