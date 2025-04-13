import React from 'react';
import { Card, CardContent, CardHeader, TextField, Typography, Box, Alert, CircularProgress, Chip } from '@mui/material';
import { CheckCircle, AlertCircle, Settings } from 'lucide-react';

interface SetupConfigProps {
  categoryId?: string;
  setupEnabled: boolean;
  setupTextChannel: string;
  waitingRoomName: string;
  onSetupTextChannelChange: (value: string) => void;
  onWaitingRoomNameChange: (value: string) => void;
}

export const SetupConfig: React.FC<SetupConfigProps> = ({
  categoryId,
  setupEnabled,
  setupTextChannel,
  waitingRoomName,
  onSetupTextChannelChange,
  onWaitingRoomNameChange
}) => {
  const handleSetupTextChannelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSetupTextChannelChange(event.target.value);
  };

  const handleWaitingRoomNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onWaitingRoomNameChange(event.target.value);
  };

  return (
    <Card>
      <CardHeader
        title="Setup-Konfiguration"
        action={
          categoryId && setupEnabled && (
            <Chip
              icon={<CheckCircle size={16} />}
              label="Aktiv"
              color="success"
              size="small"
            />
          )
        }
      />
      <CardContent>
        {!categoryId && (
          <Alert severity="info" icon={<AlertCircle size={16} />} sx={{ mb: 2 }}>
            Die Setup-Konfiguration wird verfügbar, nachdem die Kategorie erstellt wurde.
          </Alert>
        )}

        <Alert severity="info" icon={<Settings size={16} />} sx={{ mb: 2 }}>
          Wenn Setup aktiviert ist, wird nach dem Speichern ein Setup-Textkanal und ein Warteraum erstellt. Benutzer können dynamische Kanäle erstellen und individuell Tracking aktivieren oder deaktivieren.
        </Alert>

        <TextField
          fullWidth
          label="Name des Setup-Textkanals"
          value={setupTextChannel}
          onChange={handleSetupTextChannelChange}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Name des Warteraums"
          value={waitingRoomName}
          onChange={handleWaitingRoomNameChange}
        />
      </CardContent>
    </Card>
  );
};
