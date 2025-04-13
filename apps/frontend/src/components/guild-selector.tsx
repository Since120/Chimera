'use client';

import React from 'react';
import { useGuild } from '@/context/guild-context';
import { Select, MenuItem, FormControl, InputLabel, CircularProgress, Box, Avatar, Typography, SelectChangeEvent } from '@mui/material'; // Import SelectChangeEvent

export function GuildSelector() {
  const { availableGuilds, currentGuild, setCurrentGuild, loading } = useGuild();

  // Debug-Ausgabe der verfügbaren Guilds
  console.log('GuildSelector: availableGuilds:', availableGuilds);
  console.log('GuildSelector: currentGuild:', currentGuild);

  const handleChange = (event: SelectChangeEvent<string>) => { // Correct event type
    const guildId = event.target.value as string | null; // Value is directly available
    setCurrentGuild(guildId);
  };

  if (loading) {
    return <CircularProgress size={24} />;
  }

  if (!availableGuilds || availableGuilds.length === 0) {
    return <Typography variant="body2" color="text.secondary">Keine Server verfügbar</Typography>;
  }

  return (
    <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
      <InputLabel id="guild-select-label">Server</InputLabel>
      <Select
        labelId="guild-select-label"
        id="guild-select"
        value={currentGuild?.id || ''}
        label="Server"
        onChange={handleChange}
        renderValue={(selectedId) => {
          if (!selectedId) {
            return <em>Server auswählen...</em>;
          }
          const guild = availableGuilds.find(g => g.id === selectedId);
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {guild?.icon_url ? (
                <img
                  src={guild.icon_url}
                  alt={guild.name}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    console.error(`Failed to load image: ${guild.icon_url}`);
                    e.currentTarget.src = '/assets/discord-default.png';
                  }}
                />
              ) : (
                <Avatar src="/assets/discord-default.png" sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>{guild?.name?.[0]}</Avatar>
              )}
              {guild?.name || 'Unbekannter Server'}
            </Box>
          );
        }}
      >
        <MenuItem value="">
          <em>Server auswählen...</em>
        </MenuItem>
        {availableGuilds.map((guild) => (
          <MenuItem key={guild.id} value={guild.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               {guild.icon_url ? (
                <>
                  {console.log('Guild icon URL:', guild.icon_url)}
                  <img
                    src={guild.icon_url}
                    alt={guild.name}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      console.error(`Failed to load image: ${guild.icon_url}`);
                      e.currentTarget.src = '/assets/discord-default.png';
                    }}
                  />
                </>
              ) : (
                <Avatar src="/assets/discord-default.png" sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>{guild.name[0]}</Avatar>
              )}
              {guild.name}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}