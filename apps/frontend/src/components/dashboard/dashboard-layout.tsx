'use client';

import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import { SideNav } from './side-nav';
import { TopNav } from './top-nav';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <Box
      component="div"
      sx={{
        display: 'flex',
        height: '100%',
        width: '100%',
        flexDirection: { xs: 'column', md: 'row' }
      }}
    >
      <TopNav />
      <SideNav />
      <Box
        component="main"
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: 'column',
          width: '100%',
          overflow: 'auto',
          pt: { xs: '64px', md: '64px' },
          pl: { md: '280px' }
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
