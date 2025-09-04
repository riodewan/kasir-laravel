import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import type { TableRow } from '../types';
import {
  Container, Typography, Card, CardContent, Chip, Button, Stack, Alert, Box, TextField,
  InputAdornment, IconButton, Tooltip, Divider, Paper
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import RoleGuard from '../components/RoleGuard';
import { useNavigate } from 'react-router-dom';

type StatusFilter = 'all' | 'available' | 'occupied';

const Dashboard: React.FC = () => {
  const [tables, setTables] = useState<TableRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
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

  const filtered = useMemo(() => {
    const qn = q.trim().toLowerCase();
    const byS = status === 'all' ? tables : tables.filter(t => t.status === status);
    if (!qn) return byS;
    return byS.filter(t => String(t.number).toLowerCase().includes(qn));
  }, [tables, q, status]);

  const stat = useMemo(() => ({
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    total: tables.length
  }), [tables]);

  const Tile: React.FC<{ t: TableRow }> = ({ t }) => (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        height: 84,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: t.status === 'available' ? 'success.light' : 'grey.400',
        color: t.status === 'available' ? 'common.white' : 'grey.900',
        cursor: t.status === 'available' ? 'pointer' : 'not-allowed',
        transition: 'transform .12s ease, box-shadow .12s ease',
        '&:hover': t.status === 'available' ? { transform: 'translateY(-2px)', boxShadow: 3 } : undefined
      }}
      onClick={() => t.status === 'available' && openOrder(t.id)}
    >
      <Stack alignItems="center" spacing={0.5}>
        <Typography fontWeight={800}>#{t.number}</Typography>
        <Chip size="small" label={t.status === 'available' ? 'Available' : 'Occupied'}
              color={t.status === 'available' ? 'success' : 'warning'}
              variant={t.status === 'available' ? 'filled' : 'outlined'} />
      </Stack>
    </Card>
  );

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack spacing={0.5}>
          <Typography variant="h4" fontWeight={800}>Table Management</Typography>
          <Typography variant="body2" color="text.secondary">Floor plan & quick stats</Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small" placeholder="Search table…"
            value={q} onChange={(e)=>setQ(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <Tooltip title="Refresh">
            <span><IconButton onClick={load} disabled={loading}><RefreshIcon /></IconButton></span>
          </Tooltip>
        </Stack>
      </Stack>

      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant={status==='all'?'contained':'outlined'} size="small" onClick={()=>setStatus('all')}>All</Button>
            <Button variant={status==='available'?'contained':'outlined'} size="small" onClick={()=>setStatus('available')}>Available</Button>
            <Button variant={status==='occupied'?'contained':'outlined'} size="small" onClick={()=>setStatus('occupied')}>Occupied</Button>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center"><Chip size="small" color="success" label="Available" /> <Typography variant="caption">= free</Typography></Stack>
            <Stack direction="row" spacing={1} alignItems="center"><Chip size="small" color="warning" label="Occupied" /> <Typography variant="caption">= in use</Typography></Stack>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        {/* grid (left 9) */}
        <Grid item xs={12} md={9}>
          <Card sx={{ p: 2, borderRadius: 3 }}>
            <Grid container spacing={1.5}>
              {filtered.map(t => (
                <Grid key={t.id} item xs={4} sm={3} md={2}>
                  <Tile t={t} />
                </Grid>
              ))}
              {filtered.length === 0 && (
                <Grid item xs={12}><Box textAlign="center" py={6} color="text.secondary">No tables</Box></Grid>
              )}
            </Grid>
          </Card>
        </Grid>

        {/* quick stats (right 3) */}
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, borderRadius: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <TableRestaurantIcon />
              <Typography fontWeight={700}>Quick Stats</Typography>
            </Stack>
            <Divider sx={{ mb: 1.5 }} />
            <Stack spacing={1.25}>
              <Stack direction="row" justifyContent="space-between"><Typography>Available</Typography><Typography fontWeight={700}>{stat.available}</Typography></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography>Occupied</Typography><Typography fontWeight={700}>{stat.occupied}</Typography></Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between"><Typography>Total</Typography><Typography fontWeight={800}>{stat.total}</Typography></Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;