'use client';

import React, { useState } from 'react';
import { Box, Container, Typography, Tabs, Tab, Paper, Divider } from '@mui/material';
import { DynamicChannelList } from '@/components/dashboard/tracking/dynamic-channels/dynamic-channel-list';
import { SetupSessionList } from '@/components/dashboard/tracking/setup-sessions/setup-session-list';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`setup-tabpanel-${index}`}
      aria-labelledby={`setup-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `setup-tab-${index}`,
    'aria-controls': `setup-tabpanel-${index}`,
  };
}

export default function SetupPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <Box sx={{ py: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Setup-Management
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Verwalten Sie dynamische Kanäle und Setup-Sessions für Ihre Kategorien.
          </Typography>

          <Paper sx={{ mt: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="setup management tabs"
                sx={{ px: 2 }}
              >
                <Tab label="Dynamische Kanäle" {...a11yProps(0)} />
                <Tab label="Setup-Sessions" {...a11yProps(1)} />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <DynamicChannelList />
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <SetupSessionList />
            </TabPanel>
          </Paper>
        </Box>
      </Container>
    </DashboardLayout>
  );
}
