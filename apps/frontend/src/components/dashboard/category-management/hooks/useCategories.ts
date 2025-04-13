'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/components/core/toaster';
import { useGuild } from '@/context/guild-context';
import * as categoriesService from '@/services/categories';
import * as zonesService from '@/services/zones';
import { CreateCategoryDto, UpdateCategoryDto, ScopeType } from 'shared-types';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Interfaces bleiben gleich...
export interface EnhancedCategory {
  id: string;
  name: string;
  guild_id: string;
  allowedRoles: string[];
  isVisible: boolean;
  sendSetup: boolean;
  trackingActive: boolean;
  setupTextChannel?: string | null;
  waitingRoomName?: string | null;
  lastActive: string;
  totalTimeSpent: number;
  totalUsers: number;
  discordCategoryId: string | null;
  deletedInDiscord: boolean;
  createdAt: Date;
  updatedAt: Date;
  zones: EnhancedZone[];
}

export interface EnhancedZone {
  id: string;
  name: string;
  zoneKey: string;
  minutesRequired: number;
  pointsGranted: number;
  lastActive: string;
  totalTimeSpent: number;
  totalUsers: number;
}

export interface CategoryInput {
  id?: string;
  name: string;
  allowedRoles: string[];
  isVisible: boolean;
  sendSetup: boolean;
  trackingActive: boolean;
  setupTextChannel?: string | null;
  waitingRoomName?: string | null;
}


export const useCategories = () => {
  const { currentGuild } = useGuild();
  const guildId = currentGuild?.id || '';
  console.log(`[useCategories] Hook initialisiert/neu gerendert mit guildId: ${guildId}`);

  const [categories, setCategories] = useState<EnhancedCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false); // Nur ein Loading-State
  const [error, setError] = useState<string | null>(null);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);
  const loadedGuildIdRef = useRef<string>(''); // Verfolgt, für welche Guild geladen wurde

  // --- Memoized Ladefunktion ---
  const loadCategories = useCallback(async (guildIdToLoad: string) => {
    if (!guildIdToLoad) {
      console.log('[useCategories] loadCategories: Keine Guild ID übergeben.');
      setCategories([]); // Zustand leeren
      return;
    }
    console.log(`[useCategories] loadCategories aufgerufen für Guild: ${guildIdToLoad}`);
    setLoading(true);
    setError(null);

    try {
      const categoriesData = await categoriesService.getCategories(ScopeType.GUILD, guildIdToLoad);
      const enhancedCategories = await Promise.all(
        categoriesData.map(async (category) => {
          const zonesData = await zonesService.getZonesByCategory(category.id);
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
          return {
            id: category.id,
            name: category.name,
            guild_id: guildIdToLoad,
            allowedRoles: category.allowedRoles || [],
            isVisible: category.isVisibleDefault,
            sendSetup: category.setupFlowEnabled,
            trackingActive: category.defaultTrackingEnabled,
            setupTextChannel: category.setupChannelId,
            waitingRoomName: category.warteraumChannelId,
            lastActive: '-',
            totalTimeSpent: 0,
            totalUsers: 0,
            discordCategoryId: category.discordCategoryId || null,
            deletedInDiscord: !category.discordCategoryId,
            createdAt: new Date(category.createdAt),
            updatedAt: new Date(category.updatedAt),
            zones: enhancedZones
          };
        })
      );

      setCategories(enhancedCategories);
      loadedGuildIdRef.current = guildIdToLoad; // Markieren als geladen
      console.log(`[useCategories] loadCategories: ${enhancedCategories.length} Kategorien geladen für ${guildIdToLoad}`);
    } catch (err) {
      console.error(`[useCategories] Fehler beim Laden der Kategorien für ${guildIdToLoad}:`, err);
      setError('Fehler beim Laden der Kategorien');
      // Fallback? Oder leeren State lassen?
      setCategories([]); // Bei Fehler leeren
      loadedGuildIdRef.current = guildIdToLoad; // Trotz Fehler als geladen markieren, um Loop zu vermeiden
    } finally {
      setLoading(false);
    }
  }, []); // Keine Abhängigkeiten, da Services und State-Setter stabil sind

  // --- Memoized Realtime Handler ---
  const handleCategoryChange = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    console.log('[HANDLER CALLED] handleCategoryChange', payload); // <-- Logging hinzufügen
    console.log(`[useCategories Realtime] Kategorie-Änderung erkannt:`, payload);
    const { eventType, new: newRecord, old: oldRecord, table } = payload;

    // Nur auf relevante Tabellen reagieren
    if (table !== 'categories') {
        console.log(`[useCategories Realtime] Ignoriere Event für Tabelle: ${table}`);
        return;
    }

    const record = newRecord || oldRecord;
    if (!record || !record.id) return; // Brauchen mindestens eine ID

    const categoryId = record.id;

    switch (eventType) {
      case 'INSERT':
      case 'UPDATE':
        (async () => {
          try {
            console.log(`[Handler Logic START] ${eventType} Category`);

            // Direkte Verwendung der Payload-Daten ohne API-Call
            if (!newRecord) {
              console.error(`[useCategories Realtime] Fehler: Keine newRecord-Daten für ${eventType}`);
              return;
            }

            // Für die Kategorie-Aktualisierung brauchen wir die Zonen
            // Hier ist ein API-Call notwendig, da die Payload keine Zonen enthält
            const zonesData = await zonesService.getZonesByCategory(categoryId);

          // Mapping der Zonen
          const enhancedZones = zonesData.map(zone => ({
            id: zone.id,
            name: zone.name,
            zoneKey: zone.zoneKey,
            minutesRequired: zone.intervalMinutes,
            pointsGranted: zone.pointsPerInterval,
            lastActive: '-',
            totalTimeSpent: 0,
            totalUsers: 0
          }));

          // Mapping aus den Payload-Daten
          const enhancedCategory: EnhancedCategory = {
            id: newRecord.id,
            name: newRecord.name,
            guild_id: currentGuild?.id || '',
            // Wir müssen die Rollen separat laden, da sie nicht in der Payload sind
            allowedRoles: [], // Wird später durch handleCategoryRoleChange aktualisiert
            isVisible: newRecord.is_visible_default,
            sendSetup: newRecord.setup_flow_enabled,
            trackingActive: newRecord.default_tracking_enabled,
            setupTextChannel: newRecord.setup_channel_id,
            waitingRoomName: newRecord.warteraum_channel_id,
            lastActive: '-',
            totalTimeSpent: 0,
            totalUsers: 0,
            discordCategoryId: newRecord.discord_category_id || null,
            deletedInDiscord: !newRecord.discord_category_id,
            createdAt: new Date(newRecord.created_at),
            updatedAt: new Date(newRecord.updated_at),
            zones: enhancedZones
          };

          console.log('[State BEFORE update]', categories);
          setCategories(prev => {
            const index = prev.findIndex(c => c.id === categoryId);
            let newState;
            if (index !== -1) {
              // Update
              console.log(`[Category ${eventType}] Updating existing category at index ${index}`);
              newState = [...prev];
              newState[index] = enhancedCategory;
            } else {
              // Insert (oder Update, falls es fehlte)
              console.log(`[Category ${eventType}] Adding new category`);
              newState = [...prev, enhancedCategory];
            }
            console.log('[State AFTER update (calculated)]', newState);
            return newState;
          });

          // Logge den State nach der Aktualisierung (im nächsten Render-Zyklus)
          setTimeout(() => {
            console.log('[State AFTER update (actual)]', categories);
          }, 0);
          console.log(`[Handler Logic END] ${eventType} Category`);
        } catch (error) {
          console.error(`[useCategories Realtime] Fehler beim Verarbeiten ${eventType}:`, error);
        }
        })();
        break;
      case 'DELETE':
        if (oldRecord?.id) {
          console.log(`[Handler Logic START] DELETE Category ${oldRecord.id}`);
          console.log('[State BEFORE delete]', categories);

          setCategories(prev => {
            console.log(`[Category DELETE] Removing category with id ${oldRecord.id}`);
            const newState = prev.filter(category => category.id !== oldRecord.id);
            console.log('[State AFTER delete (calculated)]', newState);
            return newState;
          });

          // Logge den State nach der Aktualisierung (im nächsten Render-Zyklus)
          setTimeout(() => {
            console.log('[State AFTER delete (actual)]', categories);
          }, 0);

          console.log(`[Handler Logic END] DELETE Category ${oldRecord.id}`);
        }
        break;
      default:
        console.log(`[useCategories Realtime] Unbekannter Event-Typ für categories: ${eventType}`);
    }
  }, [categories, currentGuild?.id, setCategories, categoriesService, zonesService]); // Abhängigkeiten für korrekte Aktualisierung

  const handleZoneChangeInCategory = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    console.log('[HANDLER CALLED] handleZoneChangeInCategory', payload); // <-- Logging hinzufügen
    console.log(`[useCategories Realtime] Zonen-Änderung erkannt:`, payload);
    const { new: newRecord, old: oldRecord, table } = payload;

    // Nur auf relevante Tabellen reagieren
    if (table !== 'zones') {
        console.log(`[useCategories Realtime] Ignoriere Event für Tabelle: ${table}`);
        return;
    }

    const record = newRecord || oldRecord;
    if (!record || !record.category_id) return;

    const categoryId = record.category_id;

    // Lade Zonen für die betroffene Kategorie neu und update die Kategorie im State
    (async () => {
      try {
        console.log(`[Handler Logic START] Update Zones for Category ${categoryId}`);
        const zonesData = await zonesService.getZonesByCategory(categoryId);

        // Vollständiges Mapping statt Platzhalter
        const enhancedZones = zonesData.map(zone => ({
          id: zone.id,
          name: zone.name,
          zoneKey: zone.zoneKey,
          minutesRequired: zone.intervalMinutes,
          pointsGranted: zone.pointsPerInterval,
          lastActive: '-',
          totalTimeSpent: 0,
          totalUsers: 0
        }));

        console.log('[State BEFORE zone update]', categories);
        setCategories(prev => {
          console.log(`[Zone Change] Updating zones for category ${categoryId}`);
          const categoryIndex = prev.findIndex(c => c.id === categoryId);

          if (categoryIndex === -1) {
            console.log(`[Zone Change] Category ${categoryId} not found in state, no update needed`);
            return prev;
          }

          const newState = [...prev];
          newState[categoryIndex] = {
            ...newState[categoryIndex],
            zones: enhancedZones
          };

          console.log('[State AFTER zone update (calculated)]', newState);
          return newState;
        });

        // Logge den State nach der Aktualisierung (im nächsten Render-Zyklus)
        setTimeout(() => {
          console.log('[State AFTER zone update (actual)]', categories);
        }, 0);
        console.log(`[Handler Logic END] Update Zones for Category ${categoryId}`);
      } catch (error) {
        console.error(`[useCategories Realtime] Fehler beim Laden der Zonen für Kategorie ${categoryId}:`, error);
      }
    })();
  }, [categories, setCategories, zonesService]); // Abhängigkeiten für korrekte Aktualisierung

  const handleCategoryRoleChange = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    console.log('[HANDLER CALLED] handleCategoryRoleChange', payload); // <-- Logging hinzufügen
    console.log(`[useCategories Realtime] Kategorie-Rollen-Änderung erkannt:`, payload);
     const { new: newRecord, old: oldRecord, table } = payload;

    // Nur auf relevante Tabellen reagieren
    if (table !== 'category_discord_role_permissions') {
        console.log(`[useCategories Realtime] Ignoriere Event für Tabelle: ${table}`);
        return;
    }

    const record = newRecord || oldRecord;
    if (!record || !record.category_id) return;

    const categoryId = record.category_id;

    // Lade die betroffene Kategorie neu, um die Rollen zu aktualisieren
    (async () => {
      try {
        console.log(`[Handler Logic START] Update Roles for Category ${categoryId}`);
        const categoryData = await categoriesService.getCategoryById(categoryId);
        if (!categoryData) {
          console.log(`[Handler Logic] Category ${categoryId} not found`);
          return;
        }

        console.log('[State BEFORE role update]', categories);
        setCategories(prev => {
          console.log(`[Role Change] Updating roles for category ${categoryId}`);
          const categoryIndex = prev.findIndex(c => c.id === categoryId);

          if (categoryIndex === -1) {
            console.log(`[Role Change] Category ${categoryId} not found in state, no update needed`);
            return prev;
          }

          const newState = [...prev];
          newState[categoryIndex] = {
            ...newState[categoryIndex],
            allowedRoles: categoryData.allowedRoles || []
          };

          console.log('[State AFTER role update (calculated)]', newState);
          return newState;
        });

        // Logge den State nach der Aktualisierung (im nächsten Render-Zyklus)
        setTimeout(() => {
          console.log('[State AFTER role update (actual)]', categories);
        }, 0);
        console.log(`[Handler Logic END] Update Roles for Category ${categoryId}`);
      } catch (error) {
        console.error(`[useCategories Realtime] Fehler beim Laden der Rollenberechtigungen für Kategorie ${categoryId}:`, error);
      }
    })();
  }, [categories, setCategories, categoriesService]); // Abhängigkeiten für korrekte Aktualisierung


  // --- Haupt-useEffect für Laden und Subscription ---
  useEffect(() => {
    const currentGuildId = currentGuild?.id;
    console.log(`[useCategories Effect] Running for guildId: ${currentGuildId || 'none'}`);

    if (!currentGuildId) {
      console.log('[useCategories Effect] No guildId, resetting.');
      setCategories([]);
      loadedGuildIdRef.current = '';
      // Alte Subscription entfernen, falls vorhanden
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current).then(() => {
           console.log('[useCategories Effect] Removed old channel on guildId clear.');
           realtimeChannelRef.current = null;
        });
      }
      return;
    }

    // Laden, wenn die Guild neu ist oder die Daten fehlen
    if (loadedGuildIdRef.current !== currentGuildId) {
      loadCategories(currentGuildId);
    }

    // Subscription Logik (unverändert zur letzten Version, nutzt jetzt memoized Handler)
    let channel: RealtimeChannel | null = realtimeChannelRef.current;
    const channelName = `categories:${currentGuildId}`;

    // Nur subscriben, wenn noch nicht oder für andere Guild subscribed
    if (!channel || channel.topic !== `realtime:${channelName}`) {
        // Alte Subscription sicher entfernen
        if (channel) {
            supabase.removeChannel(channel).then(() => {
               console.log('[useCategories Effect] Removed previous channel before new subscription.');
               realtimeChannelRef.current = null; // Wichtig: Ref zurücksetzen
            });
        }

        console.log(`[useCategories Effect] Setting up channel: ${channelName}`);
        channel = supabase.channel(channelName);

        channel
          .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, (payload) => {
            console.log('[useCategories RAW EVENT categories]', payload); // <-- Logging hinzufügen
            handleCategoryChange(payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'zones' }, (payload) => {
            console.log('[useCategories RAW EVENT zones]', payload); // <-- Logging hinzufügen
            handleZoneChangeInCategory(payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'category_discord_role_permissions' }, (payload) => {
            console.log('[useCategories RAW EVENT category_roles]', payload); // <-- Logging hinzufügen
            handleCategoryRoleChange(payload);
          })
          .subscribe((status, err) => {
            console.log(`[useCategories Effect] Sub status ${channelName}:`, status, err || '');
            if (status === 'SUBSCRIBED') {
              realtimeChannelRef.current = channel; // Ref erst bei Erfolg setzen
              // Nach erfolgreicher Subscription evtl. nochmals laden, falls initialFetch fehlgeschlagen
              if (loadedGuildIdRef.current !== currentGuildId) {
                  console.log('[useCategories Effect] Re-fetching data after successful subscription.');
                  loadCategories(currentGuildId);
              }
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
               console.error(`[useCategories Effect] Subscription failed for ${channelName}:`, err);
               realtimeChannelRef.current = null; // Bei Fehler Ref zurücksetzen
            }
          });
    } else {
        console.log(`[useCategories Effect] Already subscribed to ${channelName}`);
    }

    // Cleanup-Funktion
    return () => {
      console.log(`[useCategories Effect] Cleanup for guildId: ${currentGuildId}`);
      // Nur den Channel entfernen, der *in diesem Effekt* erstellt wurde
      if (channel && (!realtimeChannelRef.current || realtimeChannelRef.current === channel)) {
        console.log(`[useCategories Effect] Removing channel ${channel.topic}`);
        supabase.removeChannel(channel);
        if (realtimeChannelRef.current === channel) {
           realtimeChannelRef.current = null;
        }
      }
    };
  // ACHTUNG: Die Handler als Abhängigkeiten stellen sicher, dass der Effekt neu läuft, wenn
  // sich ihre Referenzen ändern (was sie dank useCallback nur tun sollten, wenn sich *ihre* Deps ändern).
  // `loadCategories` ist ebenfalls memoisiert.
  }, [currentGuild?.id, loadCategories, handleCategoryChange, handleZoneChangeInCategory, handleCategoryRoleChange]);

  // --- Restliche Funktionen (weitgehend unverändert, nutzen jetzt stabile loadCategories) ---
  const toggleCategoryExpand = useCallback((categoryId: string) => {
    setExpandedCategories(prevExpanded =>
      prevExpanded.includes(categoryId)
        ? prevExpanded.filter(id => id !== categoryId)
        : [...prevExpanded, categoryId]
    );
  }, []);

  const saveCategory = useCallback(async (categoryData: CategoryInput): Promise<boolean> => {
    if (!guildId) {
        toast.error('Keine Guild ausgewählt');
        return false;
    }
    setLoading(true);
    try {
        if (categoryData.id) {
            const updateData: UpdateCategoryDto = {
              name: categoryData.name,
              isVisibleDefault: categoryData.isVisible,
              setupFlowEnabled: categoryData.sendSetup,
              defaultTrackingEnabled: categoryData.trackingActive,
              setupChannelName: categoryData.setupTextChannel || undefined,
              warteraumChannelName: categoryData.waitingRoomName || undefined,
              discordRoleIds: categoryData.allowedRoles
            };
            await categoriesService.updateCategory(categoryData.id, updateData);
            toast.success('Kategorie erfolgreich aktualisiert');
        } else {
            const createData: CreateCategoryDto = {
              scope: {
                id: guildId,
                scopeType: ScopeType.GUILD,
                scopeId: guildId
              },
              name: categoryData.name,
              isVisibleDefault: categoryData.isVisible,
              setupFlowEnabled: categoryData.sendSetup,
              defaultTrackingEnabled: categoryData.trackingActive,
              setupChannelName: categoryData.setupTextChannel || undefined,
              warteraumChannelName: categoryData.waitingRoomName || undefined,
              discordRoleIds: categoryData.allowedRoles
            };
            await categoriesService.createCategory(createData);
            toast.success('Kategorie erfolgreich erstellt');
        }
        // Realtime sollte die Aktualisierung übernehmen, kein manuelles Laden nötig
        return true;
    } catch (err: any) {
      console.error('Fehler beim Speichern der Kategorie:', err);
      toast.error(err.response?.data?.message || 'Fehler beim Speichern der Kategorie');
      return false;
    } finally {
      setLoading(false);
    }
  }, [guildId]); // Abhängig von guildId

  const deleteCategory = useCallback(async (categoryId: string): Promise<{ success: boolean; message?: string }> => {
     setLoading(true);
     try {
         const result = await categoriesService.deleteCategory(categoryId);
         if (result.success) {
           toast.success('Kategorie erfolgreich gelöscht');
         }
         return result;
     } catch (err: any) {
       console.error('Fehler beim Löschen der Kategorie:', err);
       const errorMessage = err.response?.data?.message || 'Fehler beim Löschen der Kategorie';
       toast.error(errorMessage);
       return { success: false, message: errorMessage };
     } finally {
       setLoading(false);
     }
  }, []); // Keine Abhängigkeiten nötig

  const refetch = useCallback(() => {
    console.log('[useCategories] refetch: Starte Neuladen');
    if (currentGuild?.id) {
      loadedGuildIdRef.current = ''; // Erzwingt Neuladen im Effekt
      loadCategories(currentGuild.id); // Löst manuelles Laden aus
    }
  }, [currentGuild?.id, loadCategories]);

  const getTotalStats = useCallback(() => {
    // ... Berechnung wie bisher ...
    return { totalCategories: 0, totalUsers: 0, totalTime: 0}; // Placeholder
  }, [categories]);


  return {
    categories,
    loading,
    error,
    expandedCategories,
    searchQuery,
    setSearchQuery,
    toggleCategoryExpand,
    saveCategory,
    // updateCategoryWithZones, // Wird jetzt durch Realtime Handler abgedeckt
    deleteCategory,
    getTotalStats,
    refetch
  };
};