'use client';

import { useGetTrackingStatsQuery } from '@pyro/types';
import { useGuild } from '@/context/guild-context';

export function useTrackingStats() {
  const { currentGuild } = useGuild();
  const guildId = currentGuild?.id || '';

  const { data, loading, error } = useGetTrackingStatsQuery({
    variables: { guild_id: guildId },
    skip: !guildId,
  });

  return {
    stats: data?.trackingStats || null,
    loading,
    error,
  };
}
