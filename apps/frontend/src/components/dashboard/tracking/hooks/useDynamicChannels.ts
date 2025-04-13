'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useGuild } from '@/context/guild-context';

const GET_DYNAMIC_CHANNELS_BY_CATEGORY = gql`
  query GetDynamicChannelsByCategory($categoryId: ID!, $guild_id: String!) {
    dynamicChannelsByCategory(categoryId: $categoryId, guild_id: $guild_id) {
      id
      name
      discordChannelId
      creatorUserId
      guild_id
      categoryId
      zoneId
      isSelective
      personLimit
      createdAt
      zone {
        id
        zoneName
      }
      category {
        id
        name
      }
      allowedUsers {
        id
        userId
      }
    }
  }
`;

const DELETE_DYNAMIC_CHANNEL = gql`
  mutation DeleteDynamicChannel($id: ID!) {
    deleteDynamicChannel(id: $id)
  }
`;

export function useDynamicChannels(categoryId?: string) {
  const { currentGuild } = useGuild();
  const guildId = currentGuild?.id || '';

  const { data, loading, error, refetch } = useQuery(GET_DYNAMIC_CHANNELS_BY_CATEGORY, {
    variables: {
      categoryId: categoryId || '',
      guild_id: guildId
    },
    skip: !categoryId || !guildId,
  });

  const [deleteDynamicChannelMutation, { loading: deleteLoading }] = useMutation(DELETE_DYNAMIC_CHANNEL);

  const deleteDynamicChannel = async (id: string) => {
    try {
      await deleteDynamicChannelMutation({
        variables: { id },
        refetchQueries: [
          {
            query: GET_DYNAMIC_CHANNELS_BY_CATEGORY,
            variables: { categoryId, guild_id: guildId }
          }
        ]
      });
      return true;
    } catch (error) {
      console.error('Error deleting dynamic channel:', error);
      return false;
    }
  };

  return {
    dynamicChannels: data?.dynamicChannelsByCategory || [],
    loading,
    error,
    refetch,
    deleteDynamicChannel,
    deleteLoading
  };
}
