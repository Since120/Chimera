'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useGuild } from '@/context/guild-context';

const GET_SETUP_SESSIONS = gql`
  query GetSetupSessions($categoryId: ID!, $guild_id: String!) {
    setupSessions(categoryId: $categoryId, guild_id: $guild_id) {
      id
      userId
      guild_id
      categoryId
      trackingEnabled
      createdAt
      completedAt
      category {
        id
        name
      }
    }
  }
`;

const COMPLETE_SETUP_SESSION = gql`
  mutation CompleteSetupSession($input: CompleteSetupSessionInput!) {
    completeSetupSession(input: $input) {
      id
      completedAt
    }
  }
`;

export function useSetupSessions(categoryId?: string) {
  const { currentGuild } = useGuild();
  const guildId = currentGuild?.id || '';

  const { data, loading, error, refetch } = useQuery(GET_SETUP_SESSIONS, {
    variables: {
      categoryId: categoryId || '',
      guild_id: guildId
    },
    skip: !categoryId || !guildId,
  });

  const [completeSetupSessionMutation, { loading: completeLoading }] = useMutation(COMPLETE_SETUP_SESSION);

  const completeSetupSession = async (id: string) => {
    try {
      await completeSetupSessionMutation({
        variables: {
          input: { id }
        },
        refetchQueries: [
          {
            query: GET_SETUP_SESSIONS,
            variables: { categoryId, guild_id: guildId }
          }
        ]
      });
      return true;
    } catch (error) {
      console.error('Error completing setup session:', error);
      return false;
    }
  };

  return {
    setupSessions: data?.setupSessions || [],
    loading,
    error,
    refetch,
    completeSetupSession,
    completeLoading
  };
}
