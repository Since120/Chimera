'use client';

// apps/dashboard/src/components/dashboard/category-management/components/CategoryItem.tsx

import React from 'react';
import {
  Box, Paper, Typography, IconButton, Collapse, Grid, Chip,
  Divider, CircularProgress
} from '@mui/material';
import {
  ChevronUp, ChevronDown, Edit, Clock, Users, BarChart2, EyeOff, Trash
} from 'lucide-react';
import ZoneList from './ZoneList';
import { EnhancedCategory } from '../hooks/useCategories';
import { formatMinutes } from '../utils/formatters';

interface CategoryItemProps {
  category: EnhancedCategory;
  isExpanded: boolean;
  isUpdating?: boolean;
  onToggleExpand: (categoryId: string) => void;
  onEdit: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onAddZone: () => void;
  onEditZone: (zoneId: string) => void;
  onDeleteZone: (zoneId: string, e: React.MouseEvent) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddZone,
  onEditZone,
  onDeleteZone
}) => {
  return (
    <Paper key={category.id} variant="outlined">
      {/* Category Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          borderBottom: isExpanded ? 1 : 0,
          borderColor: 'divider',
          '&:hover': { bgcolor: 'action.hover' }
        }}
        onClick={() => onToggleExpand(category.id)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isExpanded ?
            <ChevronUp size={18} color="#6366f1" /> :
            <ChevronDown size={18} color="#6366f1" />
          }
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                {category.name}
              </Typography>
              {!category.isVisible && <EyeOff size={14} opacity={0.7} />}
              {category.trackingActive && <BarChart2 size={14} color="#6366f1" />}
            </Box>
            <Typography variant="caption" color="text.secondary">
              {category.zones?.length || 0} Zonen · {category.allowedRoles?.join(", ") || "Keine Rollen"}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Category Stats Summary */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <Clock size={14} />
            <Typography variant="body2">{formatMinutes(category.totalTimeSpent || 0)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <Users size={14} />
            <Typography variant="body2">{category.totalUsers || 0}</Typography>
          </Box>
          {/* Category Actions */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit size={16} />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(e);
              }}
            >
              <Trash size={16} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Category Details & Zones */}
      <Collapse in={isExpanded}>
        <Box sx={{ p: 2 }}>
          {/* Category Details */}
          <Grid container spacing={2} sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Grid item xs={12} md={4}>
              <Typography variant="overline" color="primary" sx={{ display: 'block', mb: 1 }}>
                Details
              </Typography>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Sichtbarkeit:</Typography>
                  <Typography variant="body2" color={category.isVisible ? 'success.main' : 'text.secondary'}>
                    {category.isVisible ? 'Sichtbar' : 'Versteckt'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Setup:</Typography>
                  <Typography variant="body2" color={category.sendSetup ? 'success.main' : 'text.secondary'}>
                    {category.sendSetup ? 'Aktiv' : 'Inaktiv'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Tracking:</Typography>
                  <Typography variant="body2" color={category.trackingActive ? 'success.main' : 'text.secondary'}>
                    {category.trackingActive ? 'Aktiv' : 'Inaktiv'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="overline" color="primary" sx={{ display: 'block', mb: 1 }}>
                Rollen
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {category.allowedRoles?.length > 0 ? (
                  category.allowedRoles.map((role) => (
                    <Chip key={role} label={role} size="small" variant="outlined" />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">Keine Rollen zugewiesen</Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="overline" color="primary" sx={{ display: 'block', mb: 1 }}>
                Statistiken
              </Typography>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Letzter Zugriff:</Typography>
                  <Typography variant="body2">{category.lastActive || '-'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Gesamtzeit:</Typography>
                  <Typography variant="body2">{formatMinutes(category.totalTimeSpent || 0)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Nutzer:</Typography>
                  <Typography variant="body2">{category.totalUsers || 0}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Zones List */}
          <ZoneList
            zones={category.zones || []}
            onAddZone={onAddZone}
            onEditZone={onEditZone}
            onDeleteZone={onDeleteZone}
          />
        </Box>
      </Collapse>
    </Paper>
  );
};

export default CategoryItem;