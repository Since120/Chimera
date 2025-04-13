'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Tooltip,
  TablePagination,
  Button
} from '@mui/material';
import { CheckCircle, Info, Clock, CheckSquare } from 'lucide-react';
import { useSetupSessions } from '../hooks/useSetupSessions';
import { useCategories } from '../../category-management/hooks/useCategories';
import { formatDate } from '@/utils/format-date';
import { ConfirmDialog } from '@/components/confirm-dialog';

export const SetupSessionList: React.FC = () => {
  const { categories, loading: categoriesLoading } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const { 
    setupSessions, 
    loading, 
    error, 
    completeSetupSession, 
    completeLoading 
  } = useSetupSessions(selectedCategoryId);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [sessionToComplete, setSessionToComplete] = useState<string | null>(null);

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategoryId(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCompleteClick = (id: string) => {
    setSessionToComplete(id);
    setCompleteDialogOpen(true);
  };

  const handleCompleteConfirm = async () => {
    if (sessionToComplete) {
      await completeSetupSession(sessionToComplete);
      setCompleteDialogOpen(false);
      setSessionToComplete(null);
    }
  };

  const handleCompleteCancel = () => {
    setCompleteDialogOpen(false);
    setSessionToComplete(null);
  };

  if (categoriesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Fehler beim Laden der Setup-Sessions: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="category-select-label">Kategorie auswählen</InputLabel>
        <Select
          labelId="category-select-label"
          id="category-select"
          value={selectedCategoryId}
          label="Kategorie auswählen"
          onChange={handleCategoryChange}
        >
          <MenuItem value="">
            <em>Bitte wählen</em>
          </MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedCategoryId ? (
        loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : setupSessions.length > 0 ? (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Benutzer</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Tracking aktiviert</TableCell>
                    <TableCell>Erstellt am</TableCell>
                    <TableCell>Abgeschlossen am</TableCell>
                    <TableCell align="right">Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {setupSessions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>{session.userId}</TableCell>
                        <TableCell>
                          {session.completedAt ? (
                            <Chip 
                              icon={<CheckCircle size={14} />} 
                              label="Abgeschlossen" 
                              color="success" 
                              size="small" 
                            />
                          ) : (
                            <Chip 
                              icon={<Clock size={14} />} 
                              label="In Bearbeitung" 
                              color="warning" 
                              size="small" 
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {session.trackingEnabled ? (
                            <Chip 
                              label="Aktiviert" 
                              color="success" 
                              size="small" 
                            />
                          ) : (
                            <Chip 
                              label="Deaktiviert" 
                              color="error" 
                              size="small" 
                            />
                          )}
                        </TableCell>
                        <TableCell>{formatDate(session.createdAt)}</TableCell>
                        <TableCell>
                          {session.completedAt ? formatDate(session.completedAt) : '-'}
                        </TableCell>
                        <TableCell align="right">
                          {!session.completedAt && (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<CheckSquare size={16} />}
                              onClick={() => handleCompleteClick(session.id)}
                              disabled={completeLoading}
                            >
                              Abschließen
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={setupSessions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Zeilen pro Seite:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
            />
          </Paper>
        ) : (
          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Info size={48} color="#9e9e9e" />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Keine Setup-Sessions gefunden
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Für diese Kategorie wurden noch keine Setup-Sessions erstellt.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Info size={48} color="#9e9e9e" />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Bitte wählen Sie eine Kategorie
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Um Setup-Sessions anzuzeigen, wählen Sie bitte eine Kategorie aus.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={completeDialogOpen}
        title="Setup-Session abschließen"
        content="Sind Sie sicher, dass Sie diese Setup-Session als abgeschlossen markieren möchten?"
        onConfirm={handleCompleteConfirm}
        onCancel={handleCompleteCancel}
        isLoading={completeLoading}
      />
    </Box>
  );
};
