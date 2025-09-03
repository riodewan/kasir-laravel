import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { TableRow } from '../types';
import { Container, Typography, Card, CardContent, Chip, Button, Stack, Alert } from '@mui/material';
import { GridLegacy as Grid } from '@mui/material'; // 👈 Grid v1 alias
import { useNavigate } from 'react-router-dom';
import RoleGuard from '../components/RoleGuard';

const Dashboard: React.FC = () => {
  const [tables, setTables] = useState<TableRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();

  const load = async () => {
    setErr(null);
    try {
      const res = await api.get('/tables');
      setTables(res.data.data ?? res.data);
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Failed to fetch tables');
    }
  };

  useEffect(() => { load(); }, []);

  const openOrder = async (tableId: number) => {
    try {
      const res = await api.post('/orders/open', { table_id: tableId });
      const orderId = res.data?.data?.id ?? res.data?.id;
      nav(`/orders/${orderId}`);
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Failed to open order');
      await load();
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      <Grid container spacing={2}>
        {tables.map((t) => (
          <Grid key={t.id} item xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Table #{t.number}</Typography>
                  <Chip
                    label={t.status}
                    color={t.status === 'available' ? 'success' : 'warning'}
                    size="small"
                  />
                </Stack>

                <RoleGuard allow={['waiter']}>
                  <Button
                    sx={{ mt: 2 }}
                    onClick={() => openOrder(t.id)}
                    variant="contained"
                    disabled={t.status !== 'available'}
                  >
                    Open Order
                  </Button>
                </RoleGuard>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard;