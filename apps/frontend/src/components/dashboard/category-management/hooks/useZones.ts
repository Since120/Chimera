'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/components/core/toaster';
import { EnhancedZone } from './useCategories'; // Typ importieren
import * as zonesService from '@/services/zones';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Interface mit category_id aktualisiert
export interface ZoneInput {
  id?: string;
  name: string;
  zoneKey: string;
  minutesRequired: number;
  pointsGranted: number;
  category_id?: string;
}

export const useZones = (categoryId?: string) => {
  const [zones, setZones] = useState<EnhancedZone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);

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
      console.log(`[useZones] loadZones: ${enhancedZones.length} Zonen geladen für ${categoryIdToLoad}`);
    } catch (err) {
      console.error(`[useZones] Fehler beim Laden der Zonen für ${categoryIdToLoad}:`, err);
      setError('Fehler beim Laden der Zonen');
      setZones([]);
    } finally {
      setLoading(false);
    }
  }, []); // Keine Abhängigkeiten

  // --- Memoized Realtime Handler ---
  const handleZoneChange = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    console.log(`[Realtime DEBUG] Zone change event received:`, payload);
    console.log('[HANDLER CALLED] handleZoneChange', payload);
    console.log(`[Realtime Event] Zonen-Änderung erkannt: ${payload.eventType}`, payload);
    const { eventType, new: newRecord, old: oldRecord, table, schema } = payload;

    // Filterung: Nur auf 'zones' Tabelle und korrektes Schema reagieren
    if (schema !== 'public' || table !== 'zones') {
      console.log(`[Realtime] Ignoriere Event für Schema/Tabelle: ${schema}/${table}`);
      return;
    }

    // Filterung: Nur auf Änderungen reagieren, die die aktuelle categoryId betreffen
    const newCategoryId = newRecord && 'category_id' in newRecord ? newRecord.category_id : null;
    const oldCategoryId = oldRecord && 'category_id' in oldRecord ? oldRecord.category_id : null;
    const currentCategoryId = categoryId;

    // Wir definieren zoneId hier, damit es im gesamten Handler verfügbar ist
    let zoneId: string | null = null;

    // Bei DELETE-Events müssen wir anders vorgehen
    if (eventType === 'DELETE') {
      // Bei DELETE-Events prüfen wir, ob die Zone im aktuellen State ist
      // Wenn ja, gehört sie zur aktuellen Kategorie und wir können sie löschen
      if (oldRecord && 'id' in oldRecord) {
        zoneId = oldRecord.id as string;
        console.log(`[Realtime] DELETE-Event: ID aus oldRecord extrahiert: ${zoneId}`);
      }

      if (!zoneId) {
        console.error(`[Realtime ERROR] Keine gültige zoneId gefunden in DELETE Payload:`, payload);
        return;
      }

      // Bei DELETE-Events überspringen wir die Filterung und gehen direkt zum Handler
      console.log(`[Realtime] Verarbeite DELETE-Event für Zone ${zoneId} direkt`);
    }
    // Für INSERT und UPDATE Events prüfen wir die Kategorie-Zugehörigkeit über category_id
    else if (newCategoryId !== currentCategoryId && oldCategoryId !== currentCategoryId) {
      console.log(`[Realtime Filter] Event ignoriert, falsche Category ID. Event: ${newCategoryId || oldCategoryId}, Current: ${currentCategoryId}`);
      return;
    }

    // Sicherstellen, dass wir eine gültige ID haben (für INSERT und UPDATE)
    if (eventType !== 'DELETE') {
      const record = newRecord || oldRecord;
      zoneId = record && 'id' in record ? record.id : null;
      if (!zoneId) {
        console.error(`[Realtime ERROR] Keine gültige zoneId gefunden in Payload`);
        return;
      }
    }

    console.log(`[Realtime Event] Zone ${eventType} für ID: ${zoneId} (Kategorie: ${currentCategoryId})`);

    switch (eventType) {
      case 'INSERT':
      case 'UPDATE':
        try {
          console.log(`[Realtime Processing] Start ${eventType} for Zone ${zoneId}`);

          if (!newRecord) {
            console.error(`[Realtime ERROR] Keine newRecord-Daten für ${eventType}`);
            return;
          }

          // Zone aus Payload-Daten
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

          // React-State-Update mit Immutabilität
          setZones(prevZones => {
            const index = prevZones.findIndex(z => z.id === zoneId);

            if (index !== -1) {
              // Existierende Zone aktualisieren
              console.log(`[Realtime Update] Aktualisiere Zone ${zoneId} an Position ${index}`);
              const updatedZones = [...prevZones];
              updatedZones[index] = enhancedZone;
              return updatedZones;
            } else {
              // Neue Zone hinzufügen
              console.log(`[Realtime Update] Füge neue Zone ${zoneId} hinzu`);
              return [...prevZones, enhancedZone];
            }
          });

          console.log(`[Realtime Processing] Completed ${eventType} for Zone ${zoneId}`);
        } catch (error) {
          console.error(`[Realtime ERROR] Fehler beim Verarbeiten ${eventType}:`, error);
        }
        break;

      case 'DELETE':
        try {
          // Wir verwenden die bereits extrahierte zoneId
          if (zoneId) {
            console.log(`[Realtime Processing] Start DELETE for Zone ${zoneId}`);
            console.log(`[Realtime] DELETE Payload:`, payload);

            // Detailliertes Logging vor dem State-Update
            console.log('[Zones State BEFORE delete]', zones);

            // Filter-State-Update mit verbessertem Logging
            setZones(prevZones => {
              const prevCount = prevZones.length;
              // Wir versuchen, die Zone zu finden, aber wenn sie nicht existiert, ist das kein Problem
              // Wir entfernen sie trotzdem aus dem State, um sicherzustellen, dass sie nicht mehr angezeigt wird
              const zoneToDelete = prevZones.find(z => z.id === zoneId);

              if (!zoneToDelete) {
                console.log(`[Zone DELETE] Zone ${zoneId} not found in state, aber wir filtern trotzdem`);
                // Wir filtern trotzdem, um sicherzustellen, dass die Zone nicht mehr im State ist
                return prevZones.filter(zone => zone.id !== zoneId);
              }

              console.log(`[Zone DELETE] Found zone to delete:`, zoneToDelete);
              const newZones = prevZones.filter(zone => zone.id !== zoneId);
              console.log(`[Realtime Update] Zone ${zoneId} entfernt, Anzahl vorher: ${prevCount}, nachher: ${newZones.length}`);
              console.log('[Zones State AFTER delete (calculated)]', newZones);
              return newZones;
            });

            console.log(`[Realtime Processing] Completed DELETE for Zone ${zoneId}`);

            // Optional: Toast-Benachrichtigung hinzufügen
            const zoneName = oldRecord && 'name' in oldRecord ? oldRecord.name : 'Unbekannt';
            toast.info(`Zone "${zoneName}" wurde gelöscht`);
          } else {
            console.error(`[Realtime ERROR] Invalid DELETE payload:`, oldRecord);
          }
        } catch (error) {
          console.error(`[Realtime ERROR] Error processing zone DELETE event:`, error);
        }
        break;

      default:
        console.log(`[Realtime WARNING] Unbekannter Event-Typ für zones: ${eventType}`);
    }
  }, [categoryId, setZones, toast, zones]); // Abhängigkeiten für korrekte Aktualisierung

  // --- Haupt-useEffect ---
  useEffect(() => {
    console.log('[useZones] Realtime-Subscription wird eingerichtet...');
    console.log(`[useZones Effect] Running for categoryId: ${categoryId || 'none'}`);

    if (!categoryId) {
      console.log('[useZones Effect] No categoryId, resetting.');
      setZones([]);

      // Alte Subscription entfernen, falls vorhanden
      if (realtimeChannelRef.current) {
        console.log('[useZones Effect] Versuche, alten Channel zu entfernen...');
        supabase.removeChannel(realtimeChannelRef.current)
          .then(() => {
            console.log('[useZones Effect] Removed old channel on categoryId clear.');
            realtimeChannelRef.current = null;
          })
          .catch(err => {
            console.error('[useZones Effect] Fehler beim Entfernen des Channels:', err);
            realtimeChannelRef.current = null;
          });
      }
      return;
    }

    // Immer die Daten für die aktuelle Kategorie laden
    loadZones(categoryId);

    // Eindeutige ID für diesen Effect-Durchlauf generieren (hilft bei Strict Mode)
    const effectInstanceId = Date.now().toString();
    console.log(`[useZones Effect] Creating new effect instance: ${effectInstanceId}`);

    // Subscription-Logik mit verbessertem Schutz gegen Race-Conditions
    let channel: RealtimeChannel | null = realtimeChannelRef.current;
    const channelName = `zones:${categoryId}`;

    // Prüfen, ob wir bereits für diese Kategorie subscribed sind
    if (channel && channel.topic === `realtime:${channelName}`) {
      console.log(`[useZones Effect] Already subscribed to ${channelName}, testing connection...`);

      // Test-Event senden, um zu prüfen, ob der Channel noch aktiv ist
      try {
        channel.send({
          type: 'broadcast',
          event: 'connection-check',
          payload: { timestamp: new Date().toISOString(), instance: effectInstanceId }
        });
        console.log(`[useZones Effect] Test event sent on existing channel.`);
        return; // Existierenden Channel behalten
      } catch (err) {
        console.error(`[useZones Effect] Error testing existing channel:`, err);
        // Bei Fehler weitermachen und einen neuen Channel erstellen
      }
    }

    console.log(`[useZones Effect] Setting up new subscription for ${channelName}`);

    // Verbesserte asynchrone Hilfsfunktion zum Erstellen eines neuen Channels
    const setupNewChannel = async (): Promise<RealtimeChannel> => {
      console.log(`[useZones Effect] Setting up new channel: ${channelName}`);

      // Alte Channels mit diesem Namen entfernen
      const existingChannels = supabase.getChannels();
      for (const existingChannel of existingChannels) {
        if (existingChannel.topic === `realtime:${channelName}`) {
          console.log(`[useZones Effect] Removing stale channel with same name: ${existingChannel.topic}`);
          try {
            await supabase.removeChannel(existingChannel);
          } catch (error) {
            console.error(`[useZones Effect] Error removing stale channel:`, error);
          }
        }
      }

      // Neuen Channel erstellen mit erweiterten Konfigurationsoptionen
      const newChannel = supabase.channel(channelName, {
        config: {
          broadcast: { self: true }, // Auch eigene Broadcast-Events empfangen
          presence: { key: `user-${effectInstanceId}` }, // Presence für Debug-Zwecke
        }
      });

      // Channel-Events registrieren
      newChannel
        // Realtime für Zonen-Änderungen direkt überwachen
        .on('postgres_changes', {
          event: '*', // Lausche auf alle Events
          schema: 'public',
          table: 'zones',
          filter: `category_id=eq.${categoryId}` // Filter auf Server-Seite!
        }, handleZoneChange)
        // Test-Events für Debug und Verbindungsüberprüfung
        .on('broadcast', { event: 'connection-check' }, (payload) => {
          console.log(`[useZones Effect] Received connection check: ${effectInstanceId}`, payload);
        })
        // Channel-Status-Events mit verbesserten Statusinformationen
        .subscribe(async (status, err) => {
          if (err) {
            console.error(`[useZones Effect] Subscription error (${effectInstanceId}):`, err);
          }
          console.log(`[useZones Effect] Sub status ${channelName} (${effectInstanceId}):`, status, err || '');

          if (status === 'SUBSCRIBED') {
            console.log(`[useZones Effect] Successfully subscribed to ${channelName} (${effectInstanceId})`);

            // Sicherer Update der Channel-Referenz
            if (!realtimeChannelRef.current ||
                realtimeChannelRef.current === newChannel ||
                realtimeChannelRef.current.topic !== `realtime:${channelName}`) {
              realtimeChannelRef.current = newChannel;

              // Test-Event für den neuen Channel
              try {
                newChannel.send({
                  type: 'broadcast',
                  event: 'connection-check',
                  payload: { message: 'New zone channel initialized', instance: effectInstanceId }
                });
                console.log(`[useZones Effect] Test event sent on new channel (${effectInstanceId}).`);
              } catch (err) {
                console.error(`[useZones Effect] Error sending test event on new channel:`, err);
              }
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.error(`[useZones Effect] Subscription issue for ${channelName} (${effectInstanceId}):`, err || status);

            // Nur zurücksetzen, wenn es unser Channel ist
            if (realtimeChannelRef.current === newChannel) {
              console.log(`[useZones Effect] Resetting channel ref due to ${status}`);
              realtimeChannelRef.current = null;

              // Kein automatisches Neuladen mehr, um Render-Loops zu vermeiden
              if (status === 'TIMED_OUT' && categoryId) {
                console.log(`[useZones Effect] Timeout für Kategorie ${categoryId}, manuelles Neuladen empfohlen`);
              }
            }
          }
        });

      return newChannel;
    };

    // Verbesserte asynchrone Setup-Funktion
    const setupSubscription = async () => {
      try {
        // Wenn wir bereits einen Channel haben, entfernen wir ihn zuerst
        if (channel) {
          console.log(`[useZones Effect] Removing previous channel ${channel.topic} (${effectInstanceId})`);
          await supabase.removeChannel(channel);
          console.log(`[useZones Effect] Previous channel removed successfully (${effectInstanceId}).`);

          // Referenz sicher zurücksetzen
          if (realtimeChannelRef.current === channel) {
            realtimeChannelRef.current = null;
          }
        }

        // Erstelle einen neuen Channel
        channel = await setupNewChannel();

      } catch (error) {
        console.error(`[useZones Effect] Error during subscription setup (${effectInstanceId}):`, error);

        // Im Fehlerfall: Sicherheitsmaßnahme, setze einen neuen Channel auf
        if (!realtimeChannelRef.current) {
          console.log(`[useZones Effect] Setting up fallback channel after error (${effectInstanceId})`);
          try {
            channel = await setupNewChannel();
          } catch (fallbackError) {
            console.error(`[useZones Effect] Fallback channel setup also failed (${effectInstanceId}):`, fallbackError);
            // Kein setTimeout mehr, um Render-Loops zu vermeiden
            if (categoryId) {
              console.log(`[useZones Effect] Fallback: Manuelles Laden für ${categoryId} wird empfohlen`);
            }
          }
        }
      }
    };

    // Starte den Subscription-Prozess
    setupSubscription();

    // Verbesserte Cleanup-Funktion
    return () => {
      console.log(`[useZones Effect] Cleanup for categoryId: ${categoryId} (${effectInstanceId})`);

      // Wir säubern nur den Channel, der in diesem Effect erstellt wurde
      if (channel) {
        const channelToRemove = channel; // Lokale Kopie für die Closure

        console.log(`[useZones Effect] Cleanup removing channel ${channelToRemove.topic} (${effectInstanceId})`);

        // Verbesserte Entfernungslogik mit Wiederholungsversuch
        const removeChannel = async () => {
          try {
            await supabase.removeChannel(channelToRemove);
            console.log(`[useZones Effect] Channel successfully removed in cleanup (${effectInstanceId}).`);

            // Setze die ref nur zurück, wenn es unser Channel ist
            if (realtimeChannelRef.current === channelToRemove) {
              realtimeChannelRef.current = null;
            }
          } catch (err) {
            console.error(`[useZones Effect] Error removing channel in cleanup (${effectInstanceId}):`, err);

            // Erneuter Versuch nach kurzer Verzögerung
            console.log(`[useZones Effect] Retrying channel removal...`);
            try {
              await supabase.removeChannel(channelToRemove);
              console.log(`[useZones Effect] Channel successfully removed on retry (${effectInstanceId}).`);
            } catch (retryErr) {
              console.error(`[useZones Effect] Retry also failed, giving up (${effectInstanceId}).`);
            }

            // Im Fehlerfall trotzdem ref zurücksetzen, falls es unser Channel ist
            if (realtimeChannelRef.current === channelToRemove) {
              realtimeChannelRef.current = null;
            }
          }
        };

        removeChannel();
      }
    };
  }, [categoryId, loadZones]); // Minimale Abhängigkeiten

  // --- Restliche Funktionen ---
  const saveZone = useCallback(async (zoneData: ZoneInput): Promise<boolean> => {
    if (!categoryId) {
      toast.error('Keine Kategorie ausgewählt');
      return false;
    }

    setLoading(true);
    try {
      if (zoneData.id) {
        // Update
        const updatePayload = {
          name: zoneData.name,
          zoneKey: zoneData.zoneKey,
          pointsPerInterval: zoneData.pointsGranted,
          intervalMinutes: zoneData.minutesRequired
        };

        console.log("[saveZone] Sende Update-Request für Zone", zoneData.id);
        const result = await zonesService.updateZone(zoneData.id, updatePayload);
        console.log("[saveZone] Update Success, Backend Result:", result);
        toast.success('Zone erfolgreich aktualisiert');

        // KEINE direkte State-Aktualisierung mehr - wir verlassen uns auf Realtime!
        console.log("[saveZone] Warte auf Realtime-Event für aktualisierte Zone...");
      } else {
        // Create
        const createPayload = {
          name: zoneData.name,
          zoneKey: zoneData.zoneKey,
          pointsPerInterval: zoneData.pointsGranted,
          intervalMinutes: zoneData.minutesRequired
        };

        console.log("[saveZone] Sende Create-Request für neue Zone in Kategorie", categoryId);
        const result = await zonesService.createZone(categoryId, createPayload);
        console.log("[saveZone] Create Success, Backend Result:", result);
        toast.success('Zone erfolgreich erstellt');

        // KEINE direkte State-Aktualisierung mehr - wir verlassen uns auf Realtime!
        console.log("[saveZone] Warte auf Realtime-Event für neue Zone...");
      }

      return true;
    } catch (err: any) {
      console.error('Fehler beim Speichern der Zone:', err);
      toast.error(err.response?.data?.message || 'Fehler beim Speichern der Zone');
      return false;
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  const deleteZone = useCallback(async (zoneId: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    try {
      console.log("[deleteZone] Sende Delete-Request für Zone", zoneId);
      const result = await zonesService.deleteZone(zoneId);

      if (result.success) {
        console.log("[deleteZone] Delete Success, Backend Result:", result);
        toast.success('Zone erfolgreich gelöscht');

        // KEINE direkte State-Aktualisierung mehr - wir verlassen uns auf Realtime!
        console.log("[deleteZone] Warte auf Realtime-Event für gelöschte Zone...");
      }

      return result;
    } catch (err: any) {
      console.error('Fehler beim Löschen der Zone:', err);
      const errorMessage = err.response?.data?.message || 'Fehler beim Löschen der Zone';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    console.log('[useZones] refetch: Starte Neuladen');
    if (categoryId) {
      loadZones(categoryId);
    }
  }, [categoryId, loadZones]);

  return { zones, loading, error, saveZone, deleteZone, refetch };
};