'use client';

// apps/dashboard/src/components/dashboard/category-management/components/ZoneModal.tsx

import React, { useState, useEffect } from 'react';
import {
  Modal, Box, Typography, IconButton, TextField,
  InputAdornment, Grid, Stack, Button, Paper
} from '@mui/material';
import { X } from 'lucide-react';
import { EnhancedZone } from '../hooks/useCategories';
import { ZoneInput } from '../hooks/useZones';
import { formatMinutes } from '../utils/formatters';
import { toast } from '@/components/core/toaster';

interface ZoneModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (zone: ZoneInput) => Promise<boolean>;
  zone: EnhancedZone | null;
  categoryId: string;
  categoryName: string;
}

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  maxWidth: '95%',
  bgcolor: 'background.paper',
  border: '1px solid #333',
  boxShadow: 24,
  borderRadius: 1,
  p: 0,
  overflow: 'hidden'
};

const ZoneModal: React.FC<ZoneModalProps> = ({
  open,
  onClose,
  onSave,
  zone,
  categoryId,
  categoryName
}) => {
  const [name, setName] = useState('');
  const [zoneKey, setZoneKey] = useState('');
  const [minutesRequired, setMinutesRequired] = useState(60);
  const [pointsGranted, setPointsGranted] = useState(5);
  const [isSaving, setIsSaving] = useState(false);

  // Formular zurücksetzen, wenn sich das zone-Objekt ändert
  useEffect(() => {
    if (open) {
      if (zone) {
        setName(zone.name);
        setZoneKey(zone.zoneKey);
        setMinutesRequired(zone.minutesRequired);
        setPointsGranted(zone.pointsGranted);
      } else {
        setName('');
        setZoneKey('');
        setMinutesRequired(60);
        setPointsGranted(5);
      }
    }
  }, [zone, open]);

  const handleSave = async () => {
    setIsSaving(true);

    const zoneData: ZoneInput = {
      name: name || 'Neue Zone',
      zoneKey: zoneKey.toUpperCase() || '??',
      minutesRequired: minutesRequired || 60,
      pointsGranted: pointsGranted || 5,
      ...(zone?.id ? { id: zone.id } : {}),
      category_id: categoryId // Add category_id from category
    };

    try {
      const success = await onSave(zoneData);
      if (success) {
        onClose();
      }
    } catch (error: any) {
      console.error('Zone creation error:', error);
      if (error.message.includes('already exists') || error.message.includes('must be unique')) {
        toast.error(`Zone-Kürzel "${zoneData.zoneKey}" existiert bereits. Bitte ein eindeutiges Kürzel wählen.`);
      } else {
        toast.error('Fehler beim Speichern der Zone: ' + error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="zone-modal-title"
    >
      <Box sx={modalStyle}>
        <Box sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box>
            <Typography id="zone-modal-title" variant="h6">
              {zone?.id ? 'Zone bearbeiten' : 'Neue Zone erstellen'}
            </Typography>
            <Typography variant="caption" color="primary">
              In Kategorie: {categoryName}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <X size={18} />
          </IconButton>
        </Box>

        <Box sx={{ p: 3 }}>
          <form>
            <Stack spacing={3}>
              <TextField
                label="Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <TextField
                label="Kürzel"
                fullWidth
                value={zoneKey}
                onChange={(e) => setZoneKey(e.target.value.toUpperCase())}
                inputProps={{ maxLength: 3 }}
                helperText="Maximal 3 Zeichen, z.B. 'CZ' für 'Contested Zone'"
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Benötigte Minuten"
                    type="number"
                    fullWidth
                    value={minutesRequired}
                    onChange={(e) => setMinutesRequired(parseInt(e.target.value, 10) || 60)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">Min</InputAdornment>,
                    }}
                    inputProps={{ min: 1 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Gewährte Punkte"
                    type="number"
                    fullWidth
                    value={pointsGranted}
                    onChange={(e) => setPointsGranted(parseInt(e.target.value, 10) || 5)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">Pkt</InputAdornment>,
                    }}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
              </Grid>

              {zone?.id && (
                <Paper sx={{ p: 2, bgcolor: 'action.hover' }}>
                  <Typography variant="overline" color="primary" sx={{ display: 'block', mb: 1 }}>
                    Statistiken
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">Letzter Zugriff</Typography>
                      <Typography variant="body2">{zone.lastActive || '-'}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">Gesamtzeit</Typography>
                      <Typography variant="body2">{formatMinutes(zone.totalTimeSpent || 0)}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">Nutzer</Typography>
                      <Typography variant="body2">{zone.totalUsers || 0}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              )}
            </Stack>
          </form>
        </Box>

        <Box sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'action.hover',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1
        }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isSaving}
          >
            Abbrechen
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaving}
          >
            {zone?.id ? 'Speichern' : 'Erstellen'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ZoneModal;