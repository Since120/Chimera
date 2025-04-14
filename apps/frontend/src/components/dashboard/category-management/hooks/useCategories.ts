'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/components/core/toaster';
import { useGuild } from '@/context/guild-context';
import * as categoriesService from '@/services/categories';
import * as zonesService from '@/services/zones';
import { CreateCategoryDto, UpdateCategoryDto, ScopeType } from 'shared-types';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Interfaces bleiben gleich
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

  const [categories, setCategories] = useState<EnhancedCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);

  // Einfache Ladefunktion
  const loadCategories = useCallback(async (guildIdToLoad: string) => {
    if (!guildIdToLoad) {
      console.log('[useCategories] Keine Guild ID übergeben.');
      setCategories([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`[useCategories] Lade Kategorien für Guild: ${guildIdToLoad}`);
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

      console.log(`[useCategories] ${enhancedCategories.length} Kategorien geladen`);
      setCategories(enhancedCategories);
      return true;
    } catch (err) {
      console.error(`[useCategories] Fehler beim Laden der Kategorien:`, err);
      setError('Fehler beim Laden der Kategorien');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Direkte Verarbeitung der Realtime-Events
  const handleCategoryChange = useCallback(async (payload: RealtimePostgresChangesPayload<any>) => {
    console.log(`[Realtime DEBUG] Category change event received:`, payload);
    console.log(`[Realtime] Kategorie-Änderung: ${payload.eventType}`, payload);
    const { eventType, new: newRecord, old: oldRecord } = payload;

    // Holen der aktuellen Guild ID
    const currentGuildId = currentGuild?.id;
    if (!currentGuildId) {
      console.log('[Realtime] Ignoriere Event, da keine Guild ausgewählt ist');
      return;
    }

    if (!newRecord && !oldRecord) {
      console.log('[Realtime] Ignoriere Event, da keine Daten vorhanden sind');
      return;
    }

    const record = newRecord || oldRecord || {};
    let categoryId = record.id as string | undefined;

    // Bei DELETE-Events ist die ID möglicherweise in old.id
    if (payload.eventType === 'DELETE' && oldRecord && 'id' in oldRecord) {
      categoryId = oldRecord.id as string;
      console.log(`[Realtime] DELETE-Event: ID aus oldRecord extrahiert: ${categoryId}`);
    }

    if (!categoryId) {
      console.error(`[Realtime] Keine gültige categoryId gefunden in Payload:`, payload);
      return;
    }

    // Bei DELETE-Events haben wir möglicherweise keine resource_scope_id
    // In diesem Fall überspringen wir die Filterung und verarbeiten das Event direkt
    const resourceScopeId = record.resource_scope_id;
    if (!resourceScopeId && payload.eventType !== 'DELETE') {
      console.warn('[Realtime] Kategorie hat keine resource_scope_id und ist kein DELETE-Event, kann nicht filtern');
      return;
    }

    try {
      // Bei DELETE-Events müssen wir anders vorgehen
      if (payload.eventType === 'DELETE') {
        // Bei DELETE-Events überspringen wir die Filterung und gehen direkt zum Handler
        console.log(`[Realtime] Verarbeite DELETE-Event für Kategorie ${categoryId} direkt`);
      }
      // Für INSERT und UPDATE Events prüfen wir die Guild-Zugehörigkeit über resource_scopes
      else if (resourceScopeId) {
        const { data: scopeData, error: scopeError } = await supabase
          .from('resource_scopes')
          .select('guild_id')
          .eq('id', resourceScopeId)
          .single();

        if (scopeError) {
          console.error('[Realtime] Fehler beim Laden des Resource Scope:', scopeError);
          return;
        }

        if (!scopeData) {
          console.warn(`[Realtime] Kein Resource Scope mit ID ${resourceScopeId} gefunden`);
          return;
        }

        // Guild ID vergleichen
        if (scopeData.guild_id !== currentGuildId) {
          console.log(`[Realtime] Ignoriere Event für andere Guild (Event Guild: ${scopeData.guild_id}, aktuelle Guild: ${currentGuildId})`);
          return;
        }
      }

      console.log(`[Realtime] Event für aktuelle Guild (${currentGuildId}) bestätigt, verarbeite...`);

      // Ab hier beginnt die existierende Verarbeitungslogik
      if (eventType === 'INSERT' || eventType === 'UPDATE') {
        if (!newRecord) return;

        // Direkte Umwandlung aus den Payload-Daten
        const updatedCategory: Partial<EnhancedCategory> = {
          id: newRecord.id,
          name: newRecord.name,
          guild_id: currentGuildId, // Nutze die bestätigte Guild ID
          allowedRoles: Array.isArray(newRecord.allowed_roles) ? newRecord.allowed_roles : [],
          isVisible: newRecord.is_visible_default,
          sendSetup: newRecord.setup_flow_enabled,
          trackingActive: newRecord.default_tracking_enabled,
          setupTextChannel: newRecord.setup_channel_id,
          waitingRoomName: newRecord.warteraum_channel_id,
          discordCategoryId: newRecord.discord_category_id || null,
          deletedInDiscord: !newRecord.discord_category_id,
          createdAt: new Date(newRecord.created_at),
          updatedAt: new Date(newRecord.updated_at)
        };

        // State aktualisieren
        setCategories(prevCategories => {
          // Bestehende Kategorie finden
          const index = prevCategories.findIndex(c => c.id === categoryId);

          // Wenn Kategorie gefunden, aktualisieren
          if (index !== -1) {
            console.log(`[Realtime] Aktualisiere Kategorie: ${categoryId}`);
            const updatedCategories = [...prevCategories];

            // Bestehende Zonen beibehalten
            const existingZones = updatedCategories[index].zones;

            // Alte Kategorie mit neuen Daten aktualisieren, aber Zonen beibehalten
            updatedCategories[index] = {
              ...updatedCategories[index],
              ...updatedCategory,
              zones: existingZones
            } as EnhancedCategory;

            return updatedCategories;
          }
          // Bei neuer Kategorie und INSERT
          else if (eventType === 'INSERT') {
            console.log(`[Realtime] Neue Kategorie hinzufügen: ${categoryId}`);

            // Neue Kategorie mit leeren Zonen erstellen
            const newCategory: EnhancedCategory = {
              ...(updatedCategory as EnhancedCategory),
              lastActive: '-',
              totalTimeSpent: 0,
              totalUsers: 0,
              zones: [] // Neue Kategorie hat keine Zonen
            };

            return [...prevCategories, newCategory];
          }

          return prevCategories;
        });

        // Benachrichtigung bei INSERT
        if (eventType === 'INSERT') {
          toast.success(`Neue Kategorie "${newRecord.name}" hinzugefügt`);
        }
      }
      // DELETE-Event
      else if (eventType === 'DELETE') {
        try {
          console.log(`[Realtime] Kategorie löschen: ${categoryId}`);
          console.log(`[Realtime] DELETE Payload:`, payload);

          // Detailliertes Logging vor dem State-Update
          console.log('[State BEFORE category delete]', categories);

          // Einfach aus dem State entfernen mit verbessertem Logging
          setCategories(prevCategories => {
            console.log(`[Category DELETE] Removing category with id ${categoryId}`);
            // Wir versuchen, die Kategorie zu finden, aber wenn sie nicht existiert, ist das kein Problem
            // Wir entfernen sie trotzdem aus dem State, um sicherzustellen, dass sie nicht mehr angezeigt wird
            const categoryToDelete = prevCategories.find(c => c.id === categoryId);

            if (!categoryToDelete) {
              console.log(`[Category DELETE] Category ${categoryId} not found in state, aber wir filtern trotzdem`);
              // Wir filtern trotzdem, um sicherzustellen, dass die Kategorie nicht mehr im State ist
              return prevCategories.filter(category => category.id !== categoryId);
            }

            console.log(`[Category DELETE] Found category to delete:`, categoryToDelete);
            const newState = prevCategories.filter(category => category.id !== categoryId);
            console.log('[State AFTER category delete (calculated)]', newState);
            return newState;
          });

          // Benachrichtigung
          const categoryName = oldRecord?.name || 'Unbekannt';
          toast.info(`Kategorie "${categoryName}" wurde gelöscht`);
          console.log(`[Realtime] Category delete completed for ${categoryId}`);
        } catch (error) {
          console.error(`[Realtime] Error processing category DELETE event:`, error);
        }
      }
    } catch (err) {
      console.error('[Realtime] Fehler bei der Verarbeitung des Kategorie-Events:', err);
    }
  }, [currentGuild?.id, setCategories, toast, categories, supabase]);

  // Zonen-Änderungen verarbeiten
  const handleZoneChange = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    console.log(`[Realtime] Zonen-Änderung: ${payload.eventType}`, payload);
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (!newRecord && !oldRecord) {
      console.log(`[Realtime] Zonen-Änderung: Keine Daten vorhanden`);
      return;
    }

    const record = newRecord || oldRecord || {};
    let zoneId = record.id as string | undefined;
    let categoryId = record.category_id as string | undefined;

    // Bei DELETE-Events ist die ID möglicherweise in old.id
    if (payload.eventType === 'DELETE' && oldRecord && typeof oldRecord === 'object') {
      if ('id' in oldRecord) zoneId = oldRecord.id as string;
      if ('category_id' in oldRecord) categoryId = oldRecord.category_id as string;
      console.log(`[Realtime] DELETE-Event: Zone-ID aus oldRecord extrahiert: ${zoneId}, Kategorie: ${categoryId}`);
    }

    if (!zoneId) {
      console.error(`[Realtime] Keine gültige zoneId gefunden in Payload:`, payload);
      return;
    }

    // Bei DELETE-Events können wir auch ohne categoryId arbeiten
    if (!categoryId && eventType !== 'DELETE') {
      console.error(`[Realtime] Keine gültige categoryId gefunden in Payload:`, payload);
      return;
    }

    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      if (!newRecord) return;

      // Zone aus Payload-Daten erstellen
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

      // Kategorie im State finden und Zone aktualisieren/hinzufügen
      setCategories(prevCategories => {
        const categoryIndex = prevCategories.findIndex(c => c.id === categoryId);
        if (categoryIndex === -1) return prevCategories;

        const updatedCategories = [...prevCategories];
        const updatedCategory = { ...updatedCategories[categoryIndex] };

        // Zone im Array finden
        const zoneIndex = updatedCategory.zones.findIndex(z => z.id === zoneId);

        if (zoneIndex !== -1) {
          // Zone aktualisieren
          console.log(`[Realtime] Zone aktualisieren: ${zoneId} in Kategorie ${categoryId}`);
          const updatedZones = [...updatedCategory.zones];
          updatedZones[zoneIndex] = enhancedZone;
          updatedCategory.zones = updatedZones;
        } else {
          // Neue Zone hinzufügen
          console.log(`[Realtime] Neue Zone hinzufügen: ${zoneId} zu Kategorie ${categoryId}`);
          updatedCategory.zones = [...updatedCategory.zones, enhancedZone];
        }

        updatedCategories[categoryIndex] = updatedCategory;
        return updatedCategories;
      });
    }
    // DELETE-Event
    else if (eventType === 'DELETE') {
      console.log(`[Realtime] Zone löschen: ${zoneId}${categoryId ? ` aus Kategorie ${categoryId}` : ' (Kategorie unbekannt)'}`);

      // Zone aus der Kategorie entfernen
      setCategories(prevCategories => {
        // Wenn wir keine categoryId haben, durchsuchen wir alle Kategorien
        if (!categoryId) {
          console.log(`[Realtime Zone DELETE] Keine Kategorie-ID vorhanden, durchsuche alle Kategorien nach Zone ${zoneId}`);

          // Durchsuche alle Kategorien nach der Zone
          let zoneFound = false;
          const allCategoriesUpdated = prevCategories.map(category => {
            const zoneIndex = category.zones.findIndex(z => z.id === zoneId);
            if (zoneIndex !== -1) {
              zoneFound = true;
              console.log(`[Realtime Zone DELETE] Zone ${zoneId} in Kategorie ${category.id} gefunden`);
              const updatedCategory = { ...category };
              updatedCategory.zones = updatedCategory.zones.filter(z => z.id !== zoneId);
              return updatedCategory;
            }
            return category;
          });

          if (zoneFound) {
            console.log(`[Realtime Zone DELETE] Zone ${zoneId} erfolgreich aus einer Kategorie entfernt`);
            return allCategoriesUpdated;
          }

          console.log(`[Realtime Zone DELETE] Zone ${zoneId} in keiner Kategorie gefunden`);
          return prevCategories;
        }

        // Wenn wir eine categoryId haben, versuchen wir zuerst diese Kategorie
        console.log(`[Realtime Zone DELETE] Suche Kategorie ${categoryId} für Zone ${zoneId}`);
        const categoryIndex = prevCategories.findIndex(c => c.id === categoryId);

        if (categoryIndex === -1) {
          console.log(`[Realtime Zone DELETE] Kategorie ${categoryId} nicht gefunden, durchsuche alle Kategorien nach Zone ${zoneId}`);

          // Wenn die Kategorie nicht gefunden wird, durchsuchen wir alle Kategorien nach der Zone
          let zoneFound = false;
          const allCategoriesUpdated = prevCategories.map(category => {
            const zoneIndex = category.zones.findIndex(z => z.id === zoneId);
            if (zoneIndex !== -1) {
              zoneFound = true;
              console.log(`[Realtime Zone DELETE] Zone ${zoneId} in Kategorie ${category.id} gefunden`);
              const updatedCategory = { ...category };
              updatedCategory.zones = updatedCategory.zones.filter(z => z.id !== zoneId);
              return updatedCategory;
            }
            return category;
          });

          if (zoneFound) {
            console.log(`[Realtime Zone DELETE] Zone ${zoneId} erfolgreich aus einer anderen Kategorie entfernt`);
            return allCategoriesUpdated;
          }

          console.log(`[Realtime Zone DELETE] Zone ${zoneId} in keiner Kategorie gefunden`);
          return prevCategories;
        }

        console.log(`[Realtime Zone DELETE] Kategorie ${categoryId} gefunden, entferne Zone ${zoneId}`);
        const updatedCategories = [...prevCategories];
        const updatedCategory = { ...updatedCategories[categoryIndex] };

        // Zone filtern
        updatedCategory.zones = updatedCategory.zones.filter(z => z.id !== zoneId);

        updatedCategories[categoryIndex] = updatedCategory;
        return updatedCategories;
      });
    }
  }, [setCategories, categories, supabase]);

  // Rollenberechtigungen verarbeiten
  const handleRoleChange = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    console.log(`[Realtime] Rollen-Änderung: ${payload.eventType}`, payload);
    const { new: newRecord, old: oldRecord } = payload;

    const record = newRecord || oldRecord;
    if (!record?.category_id) return;

    const categoryId = record.category_id;

    // Bei Rollenänderungen direkt die aktuellen Daten laden
    categoriesService.getCategoryById(categoryId)
      .then(categoryData => {
        if (!categoryData) return;

        // Rollen im State aktualisieren
        setCategories(prevCategories => {
          const categoryIndex = prevCategories.findIndex(c => c.id === categoryId);
          if (categoryIndex === -1) return prevCategories;

          console.log(`[Realtime] Rollenberechtigungen aktualisieren für Kategorie: ${categoryId}`);
          const updatedCategories = [...prevCategories];
          const updatedCategory = { ...updatedCategories[categoryIndex] };

          // Neue Rollen setzen
          updatedCategory.allowedRoles = [...(categoryData.allowedRoles || [])];

          updatedCategories[categoryIndex] = updatedCategory;
          return updatedCategories;
        });
      })
      .catch(err => console.error(`[Realtime] Fehler beim Laden der Rollenberechtigungen:`, err));
  }, [setCategories, categoriesService]);

  // Realtime-Subscription einrichten und Daten laden
  useEffect(() => {
    console.log('[useCategories] Realtime-Subscription wird eingerichtet...');
    const currentGuildId = currentGuild?.id;
    console.log(`[useCategories] useEffect für Guild: ${currentGuildId || 'keine'}`);

    // Falls keine Guild ausgewählt, State zurücksetzen
    if (!currentGuildId) {
      setCategories([]);

      // Alte Subscription entfernen
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current).catch(err => {
          console.error('[useCategories] Fehler beim Entfernen des Channels:', err);
        });
        realtimeChannelRef.current = null;
      }

      return;
    }

    // Immer zuerst die Daten laden
    loadCategories(currentGuildId);

    // Kanalname für diese Guild
    const channelName = `categories:${currentGuildId}`;

    // Bestehenden Channel entfernen (falls vorhanden)
    if (realtimeChannelRef.current) {
      console.log('[useCategories] Bestehenden Channel entfernen');
      supabase.removeChannel(realtimeChannelRef.current).catch(err => {
        console.error('[useCategories] Fehler beim Entfernen des bestehenden Channels:', err);
      });
      realtimeChannelRef.current = null;
    }

    // Neuen Channel erstellen
    console.log(`[useCategories] Erstelle Realtime-Channel: ${channelName}`);
    const channel = supabase.channel(channelName);

    // Channel-Referenz sofort setzen
    realtimeChannelRef.current = channel;

    // Subscription einrichten
    channel
      // Kategorie-Änderungen - FILTER ENTFERNT, stattdessen im Handler filtern
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'categories'
        // Kein guild_id Filter mehr hier
      }, handleCategoryChange)

      // Zonen-Änderungen
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'zones'
        // Kein Filter hier, da wir die category_id im Handler prüfen
      }, handleZoneChange)

      // Rollenberechtigungen
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'category_discord_role_permissions'
        // Kein Filter hier, da wir die category_id im Handler prüfen
      }, handleRoleChange)

      // Subscribe und Status-Handling
      .subscribe((status, error) => {
        if (error) {
          console.error(`[Realtime] Subscription-Fehler: ${error.message}`, error);
        }
        console.log(`[Realtime] Subscription-Status: ${status}`);

        if (status === 'SUBSCRIBED') {
          console.log(`[Realtime] Erfolgreich abonniert: ${channelName}`);
        }
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.warn(`[Realtime] Problem mit Channel: ${status}`);

          // Kein automatisches Neuladen mehr, um Render-Loops zu vermeiden
          if ((status === 'CHANNEL_ERROR' || status === 'CLOSED') && currentGuildId) {
            console.log(`[Realtime] Channel-Fehler für Guild ${currentGuildId}, manuelles Neuladen empfohlen`);
          }
        }
      });

    // Cleanup-Funktion
    return () => {
      console.log(`[useCategories] Cleanup für Guild: ${currentGuildId}`);

      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current).catch(err => {
          console.error('[useCategories] Fehler beim Cleanup des Channels:', err);
        });
        realtimeChannelRef.current = null;
      }
    };
  }, [currentGuild?.id, loadCategories]);

  // UI-Hilfsfunktionen
  const toggleCategoryExpand = useCallback((categoryId: string) => {
    setExpandedCategories(prevExpanded =>
      prevExpanded.includes(categoryId)
        ? prevExpanded.filter(id => id !== categoryId)
        : [...prevExpanded, categoryId]
    );
  }, []);

  // Kategorie speichern - KEIN direktes State-Update mehr!
  const saveCategory = useCallback(async (categoryData: CategoryInput): Promise<boolean> => {
    if (!guildId) {
      toast.error('Keine Guild ausgewählt');
      return false;
    }

    setLoading(true);

    try {
      if (categoryData.id) {
        // Kategorie aktualisieren
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
        // Neue Kategorie erstellen
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

      // Hier kein direktes State-Update mehr - wir verlassen uns auf Realtime!

      return true;
    } catch (err: any) {
      console.error('Fehler beim Speichern der Kategorie:', err);
      toast.error(err.response?.data?.message || 'Fehler beim Speichern der Kategorie');
      return false;
    } finally {
      setLoading(false);
    }
  }, [guildId]);

  // Kategorie löschen - KEIN direktes State-Update mehr!
  const deleteCategory = useCallback(async (categoryId: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);

    try {
      const result = await categoriesService.deleteCategory(categoryId);

      if (result.success) {
        toast.success('Kategorie erfolgreich gelöscht');
      }

      // Hier kein direktes State-Update mehr - wir verlassen uns auf Realtime!

      return result;
    } catch (err: any) {
      console.error('Fehler beim Löschen der Kategorie:', err);
      const errorMessage = err.response?.data?.message || 'Fehler beim Löschen der Kategorie';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Manuelle Aktualisierung
  const refetch = useCallback(() => {
    if (currentGuild?.id) {
      console.log('[useCategories] Manuelles Neuladen');
      loadCategories(currentGuild.id);
    }
  }, [currentGuild?.id, loadCategories]);

  // Statistiken berechnen
  const getTotalStats = useCallback(() => {
    const totalCategories = categories.length;
    const totalUsers = categories.reduce((sum, cat) => sum + (cat.totalUsers || 0), 0);
    const totalTime = categories.reduce((sum, cat) => sum + (cat.totalTimeSpent || 0), 0);

    return { totalCategories, totalUsers, totalTime };
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
    deleteCategory,
    getTotalStats,
    refetch
  };
};