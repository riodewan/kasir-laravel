import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { TableRow } from '../types';
import { Box, Container, Typography, Card, CardContent, Chip } from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';

const LandingTables: React.FC = () => {
  const [tables, setTables] = useState<TableRow[]>([]);

  useEffect(() => {
    api.get('/tables').then((res) => setTables(res.data.data ?? res.data));
  }, []);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Tables</Typography>
      <Grid container spacing={2}>
        {tables.map((t) => (
          <Grid key={t.id} item xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6">Table #{t.number}</Typography>
                <Chip
                  label={t.status}
                  color={t.status === 'available' ? 'success' : 'warning'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box mt={3}>
        <Typography variant="body2">Login to manage orders & foods.</Typography>
      </Box>
    </Container>
  );
};

export default LandingTables;