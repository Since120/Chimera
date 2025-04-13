'use client';

import { useGuild } from '@/context/guild-context';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { useRouter } from 'next/navigation';

export function GuildDisplay() {
  const { selectedGuild } = useGuild();
  const router = useRouter();

  if (!selectedGuild) {
    return (
      <Button
        variant="outlined"
        size="small"
        onClick={() => router.push('/guild/select')}
      >
        Server auswählen
      </Button>
    );
  }

  return (
    <Tooltip title="Server wechseln">
      <Button
        onClick={() => router.push('/guild/select')}
        sx={{
          textTransform: 'none',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          '&:hover': {
            backgroundColor: 'action.hover',
          }
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {selectedGuild.icon_url ? (
            <img
              src={selectedGuild.icon_url}
              alt={selectedGuild.name}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                console.error(`Failed to load image: ${selectedGuild.icon_url}`);
                e.currentTarget.src = '/assets/discord-default.png';
              }}
            />
          ) : (
            <Avatar
              src="/assets/discord-default.png"
              alt={selectedGuild.name}
              sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}
            >
              {selectedGuild.name.charAt(0)}
            </Avatar>
          )}
          <Typography variant="body2" fontWeight="medium">
            {selectedGuild.name}
          </Typography>
        </Stack>
      </Button>
    </Tooltip>
  );
}
