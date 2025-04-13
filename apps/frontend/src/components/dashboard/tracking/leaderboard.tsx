import React from 'react';
import { Card, CardContent, CardHeader, Typography, Box, CircularProgress, List, ListItem, ListItemAvatar, ListItemText, Avatar, Divider } from '@mui/material';
import { useLeaderboard } from '../tracking/hooks/useLeaderboard';

export const Leaderboard: React.FC = () => {
  const { users, loading } = useLeaderboard({ limit: 10 });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ p: 3 }}>
        Keine Benutzer mit Punkten gefunden.
      </Typography>
    );
  }

  return (
    <Card>
      <CardHeader title="Rangliste" />
      <CardContent>
        <List>
          {users.map((user, index) => (
            <React.Fragment key={user.id}>
              <ListItem>
                <Box sx={{ minWidth: 40, textAlign: 'center', mr: 2 }}>
                  <Typography variant="h6">{index + 1}</Typography>
                </Box>
                <ListItemAvatar>
                  <Avatar alt={user.userId}>
                    {user.userId.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={user.userId}
                  secondary={`${user.totalPoints} Punkte, ${user.totalVoiceMinutes / 60} Stunden`}
                />
                <Box>
                  <Typography variant="h6">{user.totalPoints}</Typography>
                  <Typography variant="caption" color="text.secondary">Punkte</Typography>
                </Box>
              </ListItem>
              {index < users.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};
