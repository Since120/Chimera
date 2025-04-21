'use client';

import { useGuild } from '@/context/guild-context';

/**
 * Custom Hook to check if the current user has a specific permission
 * for the currently selected guild.
 *
 * @param permissionKey The permission key string to check (e.g., 'category:create').
 * @returns True if the user has the permission, false otherwise or while loading.
 */
export function useHasPermission(permissionKey: string): boolean {
  const { selectedGuild, isLoading } = useGuild();

  // Während der Kontext lädt oder keine Guild ausgewählt ist, hat der User keine Berechtigung.
  if (isLoading || !selectedGuild) {
    return false;
  }

  // Prüfen, ob das Permissions-Array existiert und den Key enthält.
  const hasPermission = selectedGuild.permissions?.includes(permissionKey) ?? false;

  // Optional: Logging für Debugging-Zwecke
  // console.log(`[useHasPermission] Checking for '${permissionKey}': ${hasPermission}`, selectedGuild.permissions);

  return hasPermission;
}
