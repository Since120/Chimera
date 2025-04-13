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
  TablePagination
} from '@mui/material';
import { Trash2, Users, Lock, Unlock, Info } from 'lucide-react';
import { useDynamicChannels } from '../hooks/useDynamicChannels';
import { useCategories } from '../../category-management/hooks/useCategories';
import { formatDate } from '@/utils/format-date';
import { ConfirmDialog } from '@/components/confirm-dialog';

export const DynamicChannelList: React.FC = () => {
  const { categories, loading: categoriesLoading } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const { 
    dynamicChannels, 
    loading, 
    error, 
    deleteDynamicChannel, 
    deleteLoading 
  } = useDynamicChannels(selectedCategoryId);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<string | null>(null);

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

  const handleDeleteClick = (id: string) => {
    setChannelToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (channelToDelete) {
      await deleteDynamicChannel(channelToDelete);
      setDeleteDialogOpen(false);
      setChannelToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setChannelToDelete(null);
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
        Fehler beim Laden der dynamischen Kanäle: {error.message}
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
        ) : dynamicChannels.length > 0 ? (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Ersteller</TableCell>
                    <TableCell>Zone</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Erstellt am</TableCell>
                    <TableCell align="right">Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dynamicChannels
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((channel) => (
                      <TableRow key={channel.id}>
                        <TableCell>{channel.name}</TableCell>
                        <TableCell>{channel.creatorUserId}</TableCell>
                        <TableCell>{channel.zone?.zoneName || 'Keine Zone'}</TableCell>
                        <TableCell>
                          {channel.isSelective ? (
                            <Chip 
                              icon={<Lock size={14} />} 
                              label="Selektiv" 
                              color="warning" 
                              size="small" 
                            />
                          ) : (
                            <Chip 
                              icon={<Unlock size={14} />} 
                              label="Offen" 
                              color="success" 
                              size="small" 
                            />
                          )}
                          {channel.personLimit && (
                            <Tooltip title={`Begrenzt auf ${channel.personLimit} Personen`}>
                              <Chip 
                                icon={<Users size={14} />} 
                                label={channel.personLimit} 
                                color="info" 
                                size="small" 
                                sx={{ ml: 1 }}
                              />
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(channel.createdAt)}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Kanal löschen">
                            <IconButton 
                              onClick={() => handleDeleteClick(channel.id)}
                              disabled={deleteLoading}
                              color="error"
                              size="small"
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={dynamicChannels.length}
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
                  Keine dynamischen Kanäle gefunden
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Für diese Kategorie wurden noch keine dynamischen Kanäle erstellt.
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
                Um dynamische Kanäle anzuzeigen, wählen Sie bitte eine Kategorie aus.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Dynamischen Kanal löschen"
        content="Sind Sie sicher, dass Sie diesen dynamischen Kanal löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={deleteLoading}
      />
    </Box>
  );
};
