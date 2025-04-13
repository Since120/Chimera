'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/components/core/toaster';
import { EnhancedZone } from './useCategories'; // Typ importieren
// import { formatDate } from '../utils/formatters'; // Wahrscheinlich nicht benötigt
// import { useGuild } from '@/context/guild-context'; // Nicht direkt benötigt
import * as zonesService from '@/services/zones';
// Nur die tatsächlich verwendeten Typen importieren
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Interface bleibt gleich...
export interface ZoneInput {
  id?: string;
  name: string;
  zoneKey: string;
  minutesRequired: number;
  pointsGranted: number;
}

export const useZones = (categoryId?: string) => {
  // guildId wird hier nicht direkt benötigt
  const [zones, setZones] = useState<EnhancedZone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);
  const loadedCategoryIdRef = useRef<string>('');

  // --- Memoized Ladefunktion ---
  const loadZones = useCallback(async (categoryIdToLoad: string) => {
    if (!categoryIdToLoad) {
      console.log('[useZones] loadZones: Keine Kategorie ID.');
      setZones([]);
      return;
    }
    console.log(`[useZones] loadZones aufgerufen für Kategorie: ${categoryIdToLoad}`);
    setLoading(true);
    setError(null);

    try {
      const zonesData = await zonesService.getZonesByCategory(categoryIdToLoad);
      const enhancedZones: EnhancedZone[] = zonesData.map(zone => ({
        id: zone.id,
        name: zone.name,
        zoneKey: zone.zoneKey,
        minutesRequired: zone.intervalMinutes,
        pointsGranted: zone.pointsPerInterval,
        lastActive: '-',
        totalTimeSpent: 0,
        totalUsers: 0
      }));

      setZones(enhancedZones);
      loadedCategoryIdRef.current = categoryIdToLoad;
      console.log(`[useZones] loadZones: ${enhancedZones.length} Zonen geladen für ${categoryIdToLoad}`);
    } catch (err) {
      console.error(`[useZones] Fehler beim Laden der Zonen für ${categoryIdToLoad}:`, err);
      setError('Fehler beim Laden der Zonen');
      setZones([]);
      loadedCategoryIdRef.current = categoryIdToLoad; // Trotz Fehler als geladen markieren
    } finally {
      setLoading(false);
    }
  }, []); // Keine Abhängigkeiten

  // --- Memoized Realtime Handler ---
  const handleZoneChange = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    console.log('[HANDLER CALLED] handleZoneChange', payload); // <-- Logging hinzufügen
    console.log(`[useZones Realtime] Zonen-Änderung erkannt:`, payload);
    const { eventType, new: newRecord, old: oldRecord, table, schema } = payload;

    // Filterung: Nur auf 'zones' Tabelle und korrektes Schema reagieren
    if (schema !== 'public' || table !== 'zones') return;
    // Filterung: Nur auf Änderungen reagieren, die die aktuelle categoryId betreffen
    const newRecordCategoryId = newRecord ? (newRecord as any).category_id : null;
    const oldRecordCategoryId = oldRecord ? (oldRecord as any).category_id : null;

    if (newRecordCategoryId !== categoryId && oldRecordCategoryId !== categoryId) {
        console.log(`[useZones Realtime] Event ignoriert, falsche Category ID.`);
        return;
    }


    const record = newRecord || oldRecord;
    if (!record || !record.id) return;

    const zoneId = record.id;

    switch (eventType) {
      case 'INSERT':
      case 'UPDATE':
        try {
          console.log(`[Handler Logic START] ${eventType} Zone`);

          // Direkte Verwendung der Payload-Daten ohne API-Call
          if (!newRecord) {
            console.error(`[useZones Realtime] Fehler: Keine newRecord-Daten für ${eventType}`);
            return;
          }

          // Mapping aus den Payload-Daten
          const enhancedZone: EnhancedZone = {
            id: newRecord.id,
            name: newRecord.name,
            zoneKey: newRecord.zone_key,
            minutesRequired: newRecord.interval_minutes,
            pointsGranted: newRecord.points_per_interval,
            lastActive: '-',
            totalTimeSpent: 0,
            totalUsers: 0
          };

          console.log('[Zones State BEFORE update]', zones);
          setZones(prev => {
            const index = prev.findIndex(z => z.id === zoneId);
            let newState;

            if (index !== -1) {
              console.log(`[Zone ${eventType}] Updating existing zone at index ${index}`);
              newState = [...prev];
              newState[index] = enhancedZone;
            } else {
              // Nur hinzufügen, wenn es wirklich zu dieser Kategorie gehört
              if (newRecord.category_id === categoryId) {
                  console.log(`[Zone ${eventType}] Adding new zone to category ${categoryId}`);
                  newState = [...prev, enhancedZone];
              } else {
                  console.log(`[Zone ${eventType}] Zone belongs to different category, ignoring`);
                  newState = prev;
              }
            }

            console.log('[Zones State AFTER update (calculated)]', newState);
            return newState;
          });

          // Logge den State nach der Aktualisierung (im nächsten Render-Zyklus)
          setTimeout(() => {
            console.log('[Zones State AFTER update (actual)]', zones);
          }, 0);
          console.log(`[Handler Logic END] ${eventType} Zone`);
        } catch (error) {
          console.error(`[useZones Realtime] Fehler beim Verarbeiten ${eventType}:`, error);
        }
        break;
      case 'DELETE':
        if (oldRecord?.id) {
          console.log(`[Handler Logic START] DELETE Zone ${oldRecord.id}`);
          console.log('[Zones State BEFORE delete]', zones);

          setZones(prev => {
            console.log(`[Zone DELETE] Removing zone with id ${oldRecord.id}`);
            const newState = prev.filter(zone => zone.id !== oldRecord.id);
            console.log('[Zones State AFTER delete (calculated)]', newState);
            return newState;
          });

          // Logge den State nach der Aktualisierung (im nächsten Render-Zyklus)
          setTimeout(() => {
            console.log('[Zones State AFTER delete (actual)]', zones);
          }, 0);

          console.log(`[Handler Logic END] DELETE Zone ${oldRecord.id}`);
        }
        break;
      default:
        console.log(`[useZones Realtime] Unbekannter Event-Typ für zones: ${eventType}`);
    }
  }, [categoryId, zones, setZones, zonesService]); // Abhängigkeiten für korrekte Aktualisierung

  // --- Haupt-useEffect ---
  useEffect(() => {
    console.log(`[useZones Effect] Running for categoryId: ${categoryId || 'none'}`);

    if (!categoryId) {
      console.log('[useZones Effect] No categoryId, resetting.');
      setZones([]);
      loadedCategoryIdRef.current = '';
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current).then(() => {
            console.log('[useZones Effect] Removed old channel on categoryId clear.');
            realtimeChannelRef.current = null;
        });
      }
      return;
    }

    if (loadedCategoryIdRef.current !== categoryId) {
      loadZones(categoryId);
    }

    // Subscription Logik
    let channel: RealtimeChannel | null = realtimeChannelRef.current;
    const channelName = `zones:${categoryId}`;

    if (!channel || channel.topic !== `realtime:${channelName}`) {
      if (channel) {
        supabase.removeChannel(channel).then(() => {
           console.log('[useZones Effect] Removed previous channel.');
           realtimeChannelRef.current = null;
        });
      }

      console.log(`[useZones Effect] Setting up channel: ${channelName}`);
      channel = supabase.channel(channelName);

      channel
        .on('postgres_changes', {
          event: '*', // Lausche auf alle Events
          schema: 'public',
          table: 'zones',
          filter: `category_id=eq.${categoryId}` // Filter auf Server-Seite!
        }, (payload) => {
          console.log('[useZones RAW EVENT zones]', payload); // <-- Logging hinzufügen
          handleZoneChange(payload);
        })
        .subscribe((status, err) => {
          console.log(`[useZones Effect] Sub status ${channelName}:`, status, err || '');
          if (status === 'SUBSCRIBED') {
            realtimeChannelRef.current = channel;
            if (loadedCategoryIdRef.current !== categoryId) {
              loadZones(categoryId); // Erneutes Laden nach erfolgreicher Subscription
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
             console.error(`[useZones Effect] Subscription failed for ${channelName}:`, err);
             realtimeChannelRef.current = null;
          }
        });
    }

    // Cleanup
    return () => {
      console.log(`[useZones Effect] Cleanup for categoryId: ${categoryId}`);
      if (channel && (!realtimeChannelRef.current || realtimeChannelRef.current === channel)) {
         console.log(`[useZones Effect] Removing channel ${channel.topic}`);
         supabase.removeChannel(channel);
         if (realtimeChannelRef.current === channel) {
           realtimeChannelRef.current = null;
         }
      }
    };
  }, [categoryId, loadZones, handleZoneChange]); // Korrekte Abhängigkeiten

  // --- Restliche Funktionen (weitgehend unverändert) ---
  const saveZone = useCallback(async (zoneData: ZoneInput): Promise<boolean> => {
      if (!categoryId) { /* ... Fehler ... */ return false; }
      setLoading(true);
      try {
         if (zoneData.id) { /* ... Update ... */ }
         else { /* ... Create ... */ }
         toast.success('Zone gespeichert.');
         return true;
      } catch (err: any) { /* ... Fehler ... */ return false; }
      finally { setLoading(false); }
  }, [categoryId]);

  const deleteZone = useCallback(async (zoneId: string): Promise<{ success: boolean; message?: string }> => {
      setLoading(true);
      try {
         const result = await zonesService.deleteZone(zoneId);
         if (result.success) toast.success('Zone gelöscht.');
         return result;
      } catch (err: any) { /* ... Fehler ... */ return { success: false, message: 'Fehler' }; }
      finally { setLoading(false); }
  }, []);

  const refetch = useCallback(() => {
    console.log('[useZones] refetch: Starte Neuladen');
    if (categoryId) {
      loadedCategoryIdRef.current = '';
      loadZones(categoryId);
    }
  }, [categoryId, loadZones]);


  return { zones, loading, error, saveZone, deleteZone, refetch };
};