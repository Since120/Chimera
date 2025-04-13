// apps/dashboard/src/components/dashboard/category-management/components/ZoneList.tsx

'use client';

import React from 'react';
import { 
  Box, Typography, Button, Paper, TableContainer, Table, 
  TableHead, TableRow, TableCell, TableBody, IconButton, Chip
} from '@mui/material';
import { PlusCircle, Edit, Trash } from 'lucide-react';
import { EnhancedZone } from '../hooks/useCategories';
import { formatMinutes } from '../utils/formatters';

interface ZoneListProps {
  zones: EnhancedZone[];
  onAddZone: () => void;
  onEditZone: (zoneId: string) => void;
  onDeleteZone: (zoneId: string, e: React.MouseEvent) => void;
}

const ZoneList: React.FC<ZoneListProps> = ({
  zones,
  onAddZone,
  onEditZone,
  onDeleteZone
}) => {
  return (
    <>
      {/* Zones Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2">Zonen</Typography>
        <Button 
          variant="outlined" 
          size="small" 
          color="primary"
          startIcon={<PlusCircle size={12} />}
          onClick={onAddZone}
        >
          Zone hinzufügen
        </Button>
      </Box>

      {/* Zones */}
      {zones.length > 0 ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Kürzel</TableCell>
                <TableCell>Zeit/Punkte</TableCell>
                <TableCell>Letzte Aktivität</TableCell>
                <TableCell>Gesamtzeit</TableCell>
                <TableCell>Nutzer</TableCell>
                <TableCell align="right">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone.id} hover>
                  <TableCell>{zone.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={zone.zoneKey} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  </TableCell>
                  <TableCell>{zone.minutesRequired}m → {zone.pointsGranted} Punkte</TableCell>
                  <TableCell>{zone.lastActive || '-'}</TableCell>
                  <TableCell>{formatMinutes(zone.totalTimeSpent || 0)}</TableCell>
                  <TableCell>{zone.totalUsers || 0}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <IconButton 
                        size="small"
                        onClick={() => onEditZone(zone.id)}
                      >
                        <Edit size={14} />
                      </IconButton>
                      <IconButton 
                        size="small"
                        color="error"
                        onClick={(e) => onDeleteZone(zone.id, e)}
                      >
                        <Trash size={14} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }} variant="outlined">
          <Typography color="text.secondary" sx={{ mb: 1 }}>Keine Zonen in dieser Kategorie</Typography>
          <Button 
            variant="outlined" 
            size="small" 
            color="primary"
            startIcon={<PlusCircle size={12} />}
            onClick={onAddZone}
          >
            Zone hinzufügen
          </Button>
        </Paper>
      )}
    </>
  );
};

export default ZoneList;