import React from 'react';
import { Card, CardContent, CardHeader, Typography, Grid, Box, CircularProgress } from '@mui/material';
import { useTrackingStats } from '../tracking/hooks/useTrackingStats';

export const TrackingStats: React.FC = () => {
  const { stats, loading } = useTrackingStats();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ p: 3 }}>
        Keine Tracking-Daten verfügbar.
      </Typography>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardHeader title="Aktive Sitzungen" />
          <CardContent>
            <Typography variant="h4">{stats.activeSessions}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardHeader title="Benutzer mit Tracking" />
          <CardContent>
            <Typography variant="h4">{stats.usersWithTracking}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardHeader title="Gesamte Tracking-Zeit" />
          <CardContent>
            <Typography variant="h4">{stats.totalTrackingHours} Stunden</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardHeader title="Vergebene Punkte" />
          <CardContent>
            <Typography variant="h4">{stats.totalPointsAwarded}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader title="Top-Zonen nach Nutzung" />
          <CardContent>
            {stats.topZones.map((zone) => (
              <Box key={zone.id} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">{zone.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {zone.totalHours} Stunden, {zone.totalUsers} Benutzer
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
