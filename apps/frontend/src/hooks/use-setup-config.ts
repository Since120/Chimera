import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { Category, UpdateCategoryInput } from '@pyro/types';

const GET_CATEGORY = gql`
  query GetCategory($id: ID!) {
    category(id: $id) {
      id
      name
      sendSetup
      setupTextChannel
      waitingRoomName
      trackingActive
    }
  }
`;

const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($input: UpdateCategoryInput!) {
    updateCategory(updateCategoryInput: $input) {
      id
      sendSetup
      setupTextChannel
      waitingRoomName
      trackingActive
    }
  }
`;

export function useSetupConfig(categoryId?: string) {
  const { data, loading: queryLoading, error } = useQuery(GET_CATEGORY, {
    variables: { id: categoryId },
    skip: !categoryId,
  });

  const [updateCategoryMutation, { loading: mutationLoading }] = useMutation(UPDATE_CATEGORY);

  const updateCategory = async (input: Partial<UpdateCategoryInput>) => {
    if (!categoryId) return;

    await updateCategoryMutation({
      variables: {
        input: {
          id: categoryId,
          ...input,
        },
      },
      refetchQueries: [{ query: GET_CATEGORY, variables: { id: categoryId } }],
    });
  };

  return {
    category: data?.category as Category | undefined,
    updateCategory,
    loading: queryLoading || mutationLoading,
    error,
  };
}
