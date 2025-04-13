// apps/dashboard/src/components/dashboard/category-management/components/CategoryModal.tsx

'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal, Box, Typography, IconButton, TextField, Paper,
  List, ListItem, ListItemText, Checkbox, Chip, FormControlLabel,
  Switch, Stack, Button, Grid, Alert, FormControl, ListItemButton
} from '@mui/material';
import { X, AlertCircle } from 'lucide-react';
import { EnhancedCategory, CategoryInput } from '../hooks/useCategories';
import { SetupConfig } from '@/components/dashboard/tracking/setup-config';

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (category: CategoryInput) => Promise<boolean>;
  category: EnhancedCategory | null;
  availableRoles: { value: string; label: string }[];
}

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  maxWidth: '95%',
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  border: '1px solid #333',
  boxShadow: 24,
  borderRadius: 1,
  p: 0,
  display: 'flex',
  flexDirection: 'column' as 'column'
};

const CategoryModal: React.FC<CategoryModalProps> = ({
  open,
  onClose,
  onSave,
  category,
  availableRoles
}) => {
  const [name, setName] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [sendSetup, setSendSetup] = useState(false);
  const [trackingActive, setTrackingActive] = useState(true);
  const [setupTextChannel, setSetupTextChannel] = useState('setup');
  const [waitingRoomName, setWaitingRoomName] = useState('warteraum');
  const [isSaving, setIsSaving] = useState(false);

  // Formular zurücksetzen, wenn sich das category-Objekt ändert
  useEffect(() => {
    if (open) {
      if (category) {
        console.log('Loading category data:', category);
        setName(category.name);
        setSelectedRoles(category.allowedRoles ? [...category.allowedRoles] : []);
        setIsVisible(category.isVisible);
        setSendSetup(category.sendSetup);
        setTrackingActive(category.trackingActive);
        setSetupTextChannel(category.setupTextChannel || 'setup');
        setWaitingRoomName(category.waitingRoomName || 'warteraum');
      } else {
        setName('');
        setSelectedRoles([]);
        setIsVisible(true);
        setSendSetup(false);
        setTrackingActive(true);
        setSetupTextChannel('setup');
        setWaitingRoomName('warteraum');
      }
    }
  }, [category, open]);

  const toggleRole = (role: string) => {
    setSelectedRoles(prevRoles => {
      if (prevRoles.includes(role)) {
        return prevRoles.filter(r => r !== role);
      } else {
        return [...prevRoles, role];
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);

    const categoryData: CategoryInput = {
      name: name || 'Neue Kategorie',
      allowedRoles: selectedRoles,
      isVisible,
      sendSetup,
      trackingActive: sendSetup ? false : trackingActive, // Wenn Setup aktiviert ist, deaktiviere Tracking
      ...(category?.id ? { id: category.id } : {}),
      ...(sendSetup ? {
        setupTextChannel: setupTextChannel,
        waitingRoomName: waitingRoomName
      } : {
        setupTextChannel: null,
        waitingRoomName: null
      })
    };

    const success = await onSave(categoryData);

    if (success) {
      onClose();
    }

    setIsSaving(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="category-modal-title"
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
          <Typography id="category-modal-title" variant="h6">
            {category?.id ? 'Kategorie bearbeiten' : 'Neue Kategorie erstellen'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <X size={18} />
          </IconButton>
        </Box>

        <Box sx={{ p: 3, overflow: 'auto' }}>
          <form>
            <Stack spacing={3}>
              <TextField
                label="Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <FormControl fullWidth>
                <Typography variant="body2" sx={{ mb: 1 }}>Erlaubte Rollen</Typography>
                <Paper variant="outlined" sx={{ p: 1, minHeight: '42px' }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedRoles.length > 0 ? (
                      selectedRoles.map(role => (
                        <Chip
                          key={role}
                          label={availableRoles.find(r => r.value === role)?.label || role}
                          size="small"
                          onDelete={() => toggleRole(role)}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">Rollen auswählen...</Typography>
                    )}
                  </Box>
                </Paper>
                <Paper sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                  <List dense>
                    {availableRoles.map((role) => (
                      <ListItemButton
                        key={role.value}
                        onClick={() => toggleRole(role.value)}
                        selected={selectedRoles.includes(role.value)}
                      >
                        <ListItemText primary={role.label} />
                        {selectedRoles.includes(role.value) && (
                          <Checkbox checked edge="end" />
                        )}
                      </ListItemButton>
                    ))}
                  </List>
                </Paper>
              </FormControl>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isVisible}
                          onChange={() => setIsVisible(!isVisible)}
                        />
                      }
                      label="Sichtbar"
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={sendSetup}
                          onChange={() => setSendSetup(!sendSetup)}
                        />
                      }
                      label="Setup"
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={trackingActive}
                          onChange={() => setTrackingActive(!trackingActive)}
                        />
                      }
                      label="Tracking"
                    />
                  </Paper>
                </Grid>
              </Grid>

              <Alert severity="info" icon={<AlertCircle size={16} />}>
                <Typography variant="body2">
                  Eine Kategorie kann nicht gelöscht werden, solange noch Zonen darin vorhanden sind.
                </Typography>
              </Alert>

              {sendSetup && (
                <Box sx={{ mt: 2 }}>
                  <SetupConfig
                    categoryId={category?.id}
                    setupEnabled={sendSetup}
                    setupTextChannel={setupTextChannel}
                    waitingRoomName={waitingRoomName}
                    onSetupTextChannelChange={(value) => {
                      setSetupTextChannel(value);
                    }}
                    onWaitingRoomNameChange={(value) => {
                      setWaitingRoomName(value);
                    }}
                  />
                </Box>
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
            {category?.id ? 'Speichern' : 'Erstellen'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CategoryModal;