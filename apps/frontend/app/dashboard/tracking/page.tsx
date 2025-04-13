'use client';

import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Container, Stack, Tab, Tabs, Typography } from '@mui/material';
import { Settings } from 'lucide-react';
import { TrackingStats } from '@/components/dashboard/tracking/tracking-stats';
import { UserPoints } from '@/components/dashboard/tracking/user-points';
import { Leaderboard } from '@/components/dashboard/tracking/leaderboard';
import { useRouter } from 'next/navigation';

export default function TrackingPage() {
  const router = useRouter();
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, value: number) => {
    setTabIndex(value);
  };

  const handleSetupClick = () => {
    router.push('/dashboard/tracking/setup');
  };

  return (
    <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={4}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>
            <Box sx={{ flex: '1 1 auto' }}>
              <Typography variant="h4">Tracking & Punkte</Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Settings size={16} />}
              onClick={handleSetupClick}
            >
              Setup verwalten
            </Button>
          </Stack>

          <Card>
            <CardContent>
              <Tabs value={tabIndex} onChange={handleTabChange}>
                <Tab label="Statistiken" />
                <Tab label="Benutzerpunkte" />
                <Tab label="Rangliste" />
              </Tabs>

              <Box sx={{ mt: 3 }}>
                {tabIndex === 0 && <TrackingStats />}
                {tabIndex === 1 && <UserPoints />}
                {tabIndex === 2 && <Leaderboard />}
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
