import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import type { TableRow } from '../types';
import {
  Typography, Card, CardContent, Chip, Box, Stack, TextField,
  InputAdornment, Skeleton, Alert, Paper, IconButton, Tooltip, Divider, Container
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';

const LandingTables: React.FC = () => {
  const [tables, setTables] = useState<TableRow[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await api.get('/tables');
      setTables(res.data.data ?? res.data);
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Failed to load tables');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const qn = q.trim().toLowerCase();
    if (!qn) return tables;
    return tables.filter(t => String(t.number).toLowerCase().includes(qn));
  }, [tables, q]);

  const stat = useMemo(() => ({
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    total: tables.length
  }), [tables]);

  const statusChip = (s: string) => (
    <Chip
      label={s === 'available' ? 'Available' : 'Occupied'}
      color={s === 'available' ? 'success' : 'warning'}
      size="small"
      variant={s === 'available' ? 'filled' : 'outlined'}
    />
  );

  const Tile: React.FC<{ t: TableRow }> = ({ t }) => (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        height: 84,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: t.status === 'available' ? 'success.light' : 'grey.400',
        color: t.status === 'available' ? 'common.white' : 'grey.900',
        transition: 'transform .12s ease, box-shadow .12s ease',
      }}
    >
      <Stack alignItems="center" spacing={0.5}>
        <Typography fontWeight={800}>#{t.number}</Typography>
        {statusChip(t.status)}
      </Stack>
    </Card>
  );

  return (
    <Container sx={{ py: 4 }}>
      {/* Header */}
      <Stack spacing={0.5} mb={2}>
        <Typography variant="h4" fontWeight={800}>Table List</Typography>
        <Typography variant="body2" color="text.secondary">
          Browse table availability before signing in
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" gap={1} mb={2}>
        <TextField
          placeholder="Search table number…"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          size="small"
          sx={{ maxWidth: 360 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Tooltip title="Refresh">
          <span>
            <IconButton onClick={load} disabled={loading}><RefreshIcon /></IconButton>
          </span>
        </Tooltip>
      </Stack>

      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      <Grid container spacing={2}>
        {/* left grid */}
        <Grid item xs={12} md={9}>
          <Card sx={{ p: 2, borderRadius: 3 }}>
            <Grid container spacing={1.5}>
              {loading ? (
                Array.from({ length: 18 }).map((_, i) => (
                  <Grid key={i} item xs={4} sm={3} md={2}>
                    <Card sx={{ borderRadius: 2, p: 1 }}><Skeleton variant="rounded" height={64} /></Card>
                  </Grid>
                ))
              ) : filtered.length ? (
                filtered.map(t => (
                  <Grid key={t.id} item xs={4} sm={3} md={2}>
                    <Tile t={t} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Box textAlign="center" py={6} color="text.secondary">No tables</Box>
                </Grid>
              )}
            </Grid>
          </Card>
        </Grid>

        {/* right quick stats */}
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, borderRadius: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <TableRestaurantIcon />
              <Typography fontWeight={700}>Quick Stats</Typography>
            </Stack>
            <Divider sx={{ mb: 1.5 }} />
            <Stack spacing={1.25}>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Available</Typography>
                <Typography fontWeight={700}>{stat.available}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Occupied</Typography>
                <Typography fontWeight={700}>{stat.occupied}</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography>Total</Typography>
                <Typography fontWeight={800}>{stat.total}</Typography>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LandingTables;