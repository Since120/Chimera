'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { GuildSelectionInfoDto } from 'shared-types';
import { useGuild } from '@/context/guild-context';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { GuildSelector } from '@/components/guild/guild-selector';

export default function GuildSelectPage() {
  const { isAuthenticated, loading } = useAuth();
  const { currentGuild, availableGuilds } = useGuild();
  const router = useRouter();

  // Debug-Ausgabe
  console.log('Guild Select Page Status:', { loading, isAuthenticated, selectedGuild: currentGuild });

  // Wenn der Benutzer bereits eine Guild ausgewählt hat, zur Dashboard-Seite weiterleiten
  useEffect(() => {
    if (!loading && isAuthenticated && currentGuild) {
      console.log('Guild bereits ausgewählt, leite zum Dashboard weiter');
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, currentGuild, router]);

  // Wenn der Benutzer nicht authentifiziert ist, zur Login-Seite weiterleiten
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('Benutzer nicht authentifiziert, leite zur Login-Seite weiter');
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  // Wenn keine Guilds verfügbar sind, aber der Benutzer authentifiziert ist,
  // zeigen wir trotzdem die Seite an, damit der Benutzer die Meldung sieht
  useEffect(() => {
    if (!loading && isAuthenticated && availableGuilds.length === 0) {
      console.log('Keine Guilds verfügbar, zeige Hinweis an');
    }
  }, [loading, isAuthenticated, availableGuilds]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Laden...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Discord-Server auswählen
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Wähle einen Server aus, auf dem du Mitglied bist und der Bot aktiv ist.
        </Typography>
      </Box>
      <GuildSelector />
    </Container>
  );
}
