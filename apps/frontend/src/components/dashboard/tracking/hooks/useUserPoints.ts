'use client';

import { useGetUserPointsQuery } from '@pyro/types';
import { useGuild } from '@/context/guild-context';

export function useUserPoints({ page, limit }: { page: number; limit: number }) {
  const { currentGuild } = useGuild();
  const guildId = currentGuild?.id || '';

  const { data, loading, error } = useGetUserPointsQuery({
    variables: { guild_id: guildId, page, limit },
    skip: !guildId,
  });

  return {
    users: data?.userPoints.users || [],
    totalCount: data?.userPoints.totalCount || 0,
    loading,
    error,
  };
}
