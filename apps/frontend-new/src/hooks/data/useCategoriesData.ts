'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { fetchCategories } from '@/services/categories';
import type { CategoryDto } from 'shared-types';
import type { ExtendedCategoryDto } from '@/types/categories';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Hook to fetch and manage categories data with TanStack Query
 * Includes Supabase Realtime subscription for real-time updates
 */
export function useCategories(guildId: string | null | undefined) {
  const queryClient = useQueryClient();
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);

  // Fetch categories using TanStack Query
  const query = useQuery<ExtendedCategoryDto[]>({
    queryKey: ['categories', guildId],
    queryFn: async () => {
      const categories = await fetchCategories(guildId!);

      // Debug-Ausgabe für die Kategorien
      console.log('Kategorien vom Backend:', categories);

      // Mappen der allowedRoles zu discordRoleIds für die Frontend-Komponenten
      const mappedCategories = categories.map(category => ({
        ...category,
        discordRoleIds: category.allowedRoles || []
      }));

      console.log('Gemappte Kategorien mit discordRoleIds:', mappedCategories);

      return mappedCategories as unknown as ExtendedCategoryDto[];
    },
    enabled: !!guildId, // Only run the query if guildId is provided
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Set up Supabase Realtime subscription
  useEffect(() => {
    if (!guildId) return;

    // Create a Supabase Realtime channel
    const channel = supabase
      .channel('categories-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'categories',
        },
        () => {
          // Invalidate the query to trigger a refetch
          queryClient.invalidateQueries({ queryKey: ['categories', guildId] });
        }
      )
      .subscribe();

    setRealtimeChannel(channel);

    // Cleanup function
    return () => {
      if (channel) {
        supabase.removeChannel(channel).catch(err => {
          console.error('Error removing Supabase channel:', err);
        });
      }
    };
  }, [guildId, queryClient]);

  return {
    categories: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
