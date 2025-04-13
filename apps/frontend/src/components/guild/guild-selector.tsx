'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useGuild } from '@/context/guild-context';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { GuildSelectionInfoDto } from 'shared-types';

export function GuildSelector() {
  // Verwenden Sie die verfügbaren Guilds aus dem Guild-Kontext
  // Der Guild-Kontext verwendet bereits Demo-Guilds, wenn keine echten Guilds verfügbar sind
  const { availableGuilds, loading: guildLoading, currentGuild, setCurrentGuild } = useGuild();
  const [loading, setLoading] = useState(guildLoading);
  const [error, setError] = useState<string | null>(null);

  // Debug-Ausgabe
  console.log('GuildSelector Status:', {
    availableGuilds,
    selectedGuildId: currentGuild?.id,
    loading
  });

  const handleGuildSelect = (guild: GuildSelectionInfoDto) => {
    try {
      console.log('Guild ausgewählt:', guild);
      setCurrentGuild(guild.id);
    } catch (err) {
      setError('Fehler beim Auswählen der Guild');
      console.error('Fehler beim Auswählen der Guild:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (availableGuilds.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        Du bist noch kein Mitglied auf einem Discord-Server, auf dem der Bot aktiv ist.
        Lade den Bot auf deinen Server ein, um fortzufahren.
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Discord-Server auswählen"
        subheader="Wähle einen Server, auf dem du Mitglied bist und der Bot aktiv ist"
      />
      <Divider />
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <List sx={{ width: '100%' }}>
          {availableGuilds.map((guild) => (
            <ListItem key={guild.id} disablePadding>
              <ListItemButton
                selected={currentGuild?.id === guild.id}
                onClick={() => handleGuildSelect(guild)}
              >
                <ListItemAvatar>
                  <Avatar
                    src={guild.icon_url || undefined}
                    alt={guild.name}
                    sx={{ bgcolor: 'primary.main' }}
                  >
                    {guild.name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={guild.name}
                  secondary={guild.is_admin ? 'Admin-Rechte' : 'Mitglied'}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
