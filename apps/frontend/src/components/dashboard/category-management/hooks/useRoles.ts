'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGuild } from '@/context/guild-context';
import * as rolesService from '@/services/roles';

// Interface bleibt gleich...
interface DiscordRole {
  id: string;
  name: string;
  color: number;
  colorHex?: string;
  position: number;
}

export const useRoles = (guildId?: string) => {
  const { currentGuild } = useGuild();
  const [roles, setRoles] = useState<{ value: string; label: string; color: number; colorHex: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedGuildIdRef = useRef<string>('');

  // effectiveGuildId bleibt gleich
  const effectiveGuildId = React.useMemo(() => {
    const id = guildId || currentGuild?.id || '';
    console.log(`[useRoles] Effektive Guild ID berechnet: ${id}`);
    return id;
  }, [guildId, currentGuild?.id]);

  // --- Memoized Ladefunktion ---
  const loadRoles = useCallback(async (guildIdToLoad: string) => {
    if (!guildIdToLoad) {
       console.log('[useRoles] loadRoles: Keine Guild ID.');
       setRoles([]); // Leeren
       return;
    }
     if (loading && loadedGuildIdRef.current === guildIdToLoad) {
        console.log(`[useRoles] loadRoles: Already loading for ${guildIdToLoad}. Skipping.`);
        return
    }
    console.log(`[useRoles] loadRoles aufgerufen für Guild: ${guildIdToLoad}`);
    setLoading(true);
    setError(null);

    try {
      const rolesData = await rolesService.getGuildRoles(guildIdToLoad);
      const formattedRoles = rolesData.map(role => {
        const colorHex = role.colorHex || `#${role.color.toString(16).padStart(6, '0')}`;
        return {
          value: role.id,
          label: role.name,
          color: role.color,
          colorHex: colorHex
        };
      });

      setRoles(formattedRoles);
      loadedGuildIdRef.current = guildIdToLoad; // Markieren als geladen
      console.log(`[useRoles] loadRoles: ${formattedRoles.length} Rollen geladen für ${guildIdToLoad}`);
    } catch (err) {
      console.error(`[useRoles] Fehler beim Laden der Rollen für ${guildIdToLoad}:`, err);
      setError('Fehler beim Laden der Rollen');
      setRoles([]); // Bei Fehler leeren
      loadedGuildIdRef.current = guildIdToLoad; // Trotz Fehler als geladen markieren, um Loop zu vermeiden
    } finally {
      setLoading(false);
    }
  }, [loading]); // loading als Abhängigkeit

  // --- Haupt-useEffect ---
  useEffect(() => {
    console.log(`[useRoles Effect] Running for effectiveGuildId: ${effectiveGuildId}`);

    if (!effectiveGuildId) {
      console.log('[useRoles Effect] No effectiveGuildId, resetting.');
      setRoles([]);
      loadedGuildIdRef.current = '';
      return;
    }

    // Laden, wenn die Guild neu ist oder die Daten fehlen
    if (loadedGuildIdRef.current !== effectiveGuildId) {
      loadRoles(effectiveGuildId);
    } else {
       console.log(`[useRoles Effect] Daten für Guild ${effectiveGuildId} bereits geladen/Laden läuft, überspringe.`);
    }

    // Kein Cleanup nötig, da keine Subscription
  }, [effectiveGuildId, loadRoles]); // Hängt nur von ID und der memoized Ladefunktion ab

  // --- Refetch Funktion ---
  const refetch = useCallback(() => {
    console.log('[useRoles] refetch: Starte Neuladen');
    if (effectiveGuildId) {
      loadedGuildIdRef.current = ''; // Erzwingt Neuladen im Effekt
      loadRoles(effectiveGuildId); // Löst manuelles Laden aus
    }
  }, [effectiveGuildId, loadRoles]);

  return {
    roles,
    loading,
    error,
    refetch
  };
};