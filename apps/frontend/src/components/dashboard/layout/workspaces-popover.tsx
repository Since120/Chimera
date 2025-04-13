'use client';

import type * as React from 'react';
import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PlusCircle } from '@phosphor-icons/react/dist/ssr/PlusCircle';

import { useGuild } from '@/context/guild-context';

export interface WorkspacesPopoverProps {
  anchorEl: null | Element;
  onChange?: () => void;
  onClose?: () => void;
  open?: boolean;
}

export function WorkspacesPopover({
  anchorEl,
  onChange,
  onClose,
  open = false,
}: WorkspacesPopoverProps): React.JSX.Element {
  const { availableGuilds, currentGuild, setCurrentGuild } = useGuild();

  // Discord Server Icon URL erstellen
  const getDiscordIconUrl = (discordId: string, iconUrl: string | null) => {
    if (!iconUrl) return '/assets/discord-default.png'; // Fallback-Icon
    return iconUrl; // Die URL ist bereits vollständig
  };

  // Bot-Einladungs-URL
  const inviteBotUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;

  const handleGuildChange = (guildId: string) => {
    console.log('[WorkspacesPopover] Wechsle zu Server mit ID:', guildId);
    setCurrentGuild(guildId);
    onChange?.();
  };

  const handleInviteBot = () => {
    window.open(inviteBotUrl, '_blank');
    onClose?.();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: '250px' } } }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    >
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Server auswählen
        </Typography>
      </Box>

      {availableGuilds.map((guild) => (
        <MenuItem
          key={guild.id}
          onClick={() => handleGuildChange(guild.id)}
          selected={currentGuild?.id === guild.id}
        >
          <ListItemAvatar>
            <Avatar
              src={getDiscordIconUrl(guild.discord_id, guild.icon_url)}
              sx={{ '--Avatar-size': '32px' }}
              variant="rounded"
            />
          </ListItemAvatar>
          {guild.name}
        </MenuItem>
      ))}

      <Divider sx={{ my: 1 }} />

      <Box sx={{ px: 2, py: 1 }}>
        <Button
          fullWidth
          startIcon={<PlusCircle />}
          variant="outlined"
          size="small"
          onClick={handleInviteBot}
        >
          Bot zu Server hinzufügen
        </Button>
      </Box>
    </Menu>
  );
}
