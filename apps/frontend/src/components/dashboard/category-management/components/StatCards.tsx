// apps/dashboard/src/components/dashboard/category-management/components/StatCards.tsx

'use client';

import React from 'react';
import { Grid, Paper, Box, Typography } from '@mui/material';
import { BarChart2, Users, Clock } from 'lucide-react';
import { formatMinutes } from '../utils/formatters';

interface StatCardsProps {
  categoriesCount: number;
  totalUsers: number;
  totalTime: number;
}

const StatCards: React.FC<StatCardsProps> = ({ 
  categoriesCount, 
  totalUsers, 
  totalTime 
}) => {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <BarChart2 size={18} color="#6366f1" />
          <Box>
            <Typography variant="caption" color="text.secondary">Aktive Kategorien</Typography>
            <Typography variant="h6">{categoriesCount}</Typography>
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Users size={18} color="#6366f1" />
          <Box>
            <Typography variant="caption" color="text.secondary">Gesamtnutzer</Typography>
            <Typography variant="h6">{totalUsers}</Typography>
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Clock size={18} color="#6366f1" />
          <Box>
            <Typography variant="caption" color="text.secondary">Gesamtzeit</Typography>
            <Typography variant="h6">{formatMinutes(totalTime)}</Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default StatCards;