'use client'; // Required for hooks like useState, useEffect, useRouter, useAuth

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useGuild } from '@/context/guild-context'; // Import useGuild to display selected guild
import { CircularProgress, Typography, Box, Paper } from '@mui/material';

/**
 * Dashboard-Startseite
 */
export default function Page() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { currentGuild, loading: guildLoading } = useGuild();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated and loading is finished
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login'); // Adjust login path if necessary
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading indicator while auth or guild context is loading
  if (authLoading || guildLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If authenticated but loading finished, render dashboard content
  if (isAuthenticated) {
    // Hier keine Weiterleitung mehr zur Server-Auswahl, auch wenn kein Server ausgewählt ist
    // Stattdessen zeigen wir eine Meldung an, dass kein Server ausgewählt ist

    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Willkommen im Chimera Dashboard
        </Typography>
        <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
          {currentGuild ? (
            <Typography>
              Ausgewählter Server: <strong>{currentGuild.name}</strong> (ID: {currentGuild.id})
            </Typography>
          ) : (
            <Typography color="text.secondary">
              Bitte wähle einen Server über das Dropdown-Menü links oben aus.
            </Typography>
          )}
        </Paper>
        {/* Hier weiterer Dashboard-Inhalt */}
      </Box>
    );
  }

  // Fallback (sollte durch Redirect abgedeckt sein, aber sicher ist sicher)
  return null;
}
