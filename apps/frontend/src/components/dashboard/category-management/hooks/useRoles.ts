'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useGuild } from '@/context/guild-context';
import * as rolesService from '@/services/roles';

// Interface bleibt gleich
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
  
  // effectiveGuildId berechnen
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
    
    if (loading) {
      console.log(`[useRoles] loadRoles: Already loading. Skipping.`);
      return;
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
      console.log(`[useRoles] loadRoles: ${formattedRoles.length} Rollen geladen für ${guildIdToLoad}`);
    } catch (err) {
      console.error(`[useRoles] Fehler beim Laden der Rollen für ${guildIdToLoad}:`, err);
      setError('Fehler beim Laden der Rollen');
      setRoles([]); // Bei Fehler leeren
    } finally {
      setLoading(false);
    }
  }, []); // Keine Abhängigkeiten verwenden

  // --- Haupt-useEffect ---
  useEffect(() => {
    console.log(`[useRoles Effect] Running for effectiveGuildId: ${effectiveGuildId}`);

    if (!effectiveGuildId) {
      console.log('[useRoles Effect] No effectiveGuildId, resetting.');
      setRoles([]);
      return;
    }

    // Immer die Rollen für die aktuelle Guild laden
    loadRoles(effectiveGuildId);
    
    // Kein Cleanup nötig, da keine Subscription
  }, [effectiveGuildId, loadRoles]); // Hängt nur von ID und der memoized Ladefunktion ab

  // --- Refetch Funktion ---
  const refetch = useCallback(() => {
    console.log('[useRoles] refetch: Starte Neuladen');
    if (effectiveGuildId) {
      loadRoles(effectiveGuildId);
    }
  }, [effectiveGuildId, loadRoles]);

  return {
    roles,
    loading,
    error,
    refetch
  };
};