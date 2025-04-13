import React, { useState } from 'react';
import { Card, CardContent, CardHeader, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Box, CircularProgress } from '@mui/material';
import { useUserPoints } from '../tracking/hooks/useUserPoints';

export const UserPoints: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { users, loading, totalCount } = useUserPoints({ page, limit: rowsPerPage });

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ p: 3 }}>
        Keine Benutzer mit Punkten gefunden.
      </Typography>
    );
  }

  return (
    <Card>
      <CardHeader title="Benutzer-Punkte" />
      <CardContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Benutzer</TableCell>
                <TableCell>Punkte</TableCell>
                <TableCell>Voice-Zeit (Stunden)</TableCell>
                <TableCell>Zuletzt aktiv</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.userId}</TableCell>
                  <TableCell>{user.totalPoints}</TableCell>
                  <TableCell>{user.totalVoiceMinutes / 60}</TableCell>
                  <TableCell>{new Date(user.lastActiveAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </CardContent>
    </Card>
  );
};
