import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import type { TableRow } from '../types';
import {
  Container, Typography, Card, CardContent, Chip, Button, Stack, Alert, Box, Divider, Paper, IconButton, Tooltip
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import SummarizeRounded from '@mui/icons-material/SummarizeRounded';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import RefreshIcon from '@mui/icons-material/Refresh';
import RoleGuard from '../components/RoleGuard';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [tables, setTables] = useState<TableRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const load = async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await api.get('/tables');
      setTables(res.data.data ?? res.data);
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const stat = useMemo(() => ({
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    total: tables.length,
  }), [tables]);

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

  const Tile: React.FC<{ t: TableRow }> = ({ t }) => (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        p: 2,
        height: 140,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        bgcolor: t.status === 'available' ? 'success.light' : 'grey.200',
        color: t.status === 'available' ? 'common.white' : 'text.primary',
        backgroundImage: t.status === 'available'
          ? 'linear-gradient(135deg, rgba(255,255,255,.08), rgba(0,0,0,.08))'
          : 'none',
        transition: 'transform .12s ease, box-shadow .12s ease',
        '@media (hover:hover)': { '&:hover': { transform: 'translateY(-2px)' } }
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={900}>Table #{t.number}</Typography>
        <Chip
          label={t.status}
          color={t.status === 'available' ? 'success' : 'warning'}
          size="small"
          variant={t.status === 'available' ? 'filled' : 'outlined'}
          sx={{ bgcolor: t.status === 'available' ? 'rgba(255,255,255,.25)' : undefined }}
        />
      </Stack>

      <RoleGuard allow={['waiter']}>
        <Button
          onClick={() => openOrder(t.id)}
          variant="contained"
          disabled={t.status !== 'available'}
          sx={{ textTransform: 'none', alignSelf: 'flex-end' }}
        >
          Open Order
        </Button>
      </RoleGuard>
    </Card>
  );

  return (
    <Container sx={{ py: { xs: 2.5, sm: 4 } }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        sx={{ flexWrap: 'wrap', gap: 1 }}
      >
        <Stack spacing={0.5}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <TableRestaurantIcon />
            <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: 22, sm: 28 } }}>
              Dashboard
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Quick overview & open orders
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Refresh"><span><IconButton onClick={load} disabled={loading}><RefreshIcon /></IconButton></span></Tooltip>
          <Button
            startIcon={<SummarizeRounded />}
            variant="outlined"
            onClick={() => nav('/orders')}
            sx={{ textTransform: 'none' }}
          >
            View Orders
          </Button>
        </Stack>
      </Stack>

      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      {/* Summary */}
      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          <Stack><Typography color="text.secondary">Available</Typography><Typography variant="h6" fontWeight={900}>{stat.available}</Typography></Stack>
          <Stack><Typography color="text.secondary">Occupied</Typography><Typography variant="h6" fontWeight={900}>{stat.occupied}</Typography></Stack>
          <Stack><Typography color="text.secondary">Total</Typography><Typography variant="h6" fontWeight={900}>{stat.total}</Typography></Stack>
        </Stack>
        <Divider sx={{ mt: 1.5 }} />
      </Paper>

      {/* Grid */}
      <Grid container spacing={2}>
        {tables.map(t => (
          <Grid key={t.id} item xs={12} sm={6} md={4} lg={3}>
            <Tile t={t} />
          </Grid>
        ))}
        {!tables.length && (
          <Grid item xs={12}><Box textAlign="center" color="text.secondary" py={6}>No tables</Box></Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard;