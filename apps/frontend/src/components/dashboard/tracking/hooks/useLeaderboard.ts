'use client';

import { useGetLeaderboardQuery } from '@pyro/types';
import { useGuild } from '@/context/guild-context';

export function useLeaderboard({ limit }: { limit: number }) {
  const { currentGuild } = useGuild();
  const guildId = currentGuild?.id || '';

  const { data, loading, error } = useGetLeaderboardQuery({
    variables: { guild_id: guildId, limit },
    skip: !guildId,
  });

  return {
    users: data?.topUsersByPoints || [],
    loading,
    error,
  };
}
