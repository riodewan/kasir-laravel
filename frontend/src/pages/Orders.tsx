import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import type { ApiList, Order } from '../types';
import {
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, Stack, Box, Skeleton, Alert, ToggleButton, ToggleButtonGroup, Divider, IconButton, Tooltip
} from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';

type Filter = 'all' | 'open' | 'closed';

const Orders: React.FC = () => {
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const nav = useNavigate();

  const load = async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await api.get('/orders');
      const paged = (res.data?.data as ApiList<Order>) || res.data;
      const data = (paged as any)?.data ?? paged;
      setRows(data);
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  // Filter status
  const filtered = useMemo(() => {
    if (filter === 'all') return rows;
    return rows.filter(r => r.status === filter);
  }, [rows, filter]);

  // Urutkan terbaru dulu: pakai created_at desc; fallback ke id desc kalau created_at tidak ada
  const list = useMemo(() => {
    const getTime = (x: any) => (x?.created_at ? new Date(x.created_at).getTime() : 0);
    return [...filtered].sort((a, b) => {
      const t = getTime(b) - getTime(a);
      return t !== 0 ? t : (Number(b.id) - Number(a.id));
    });
  }, [filtered]);

  // Stats kecil
  const stat = useMemo(() => ({
    open: rows.filter(r => r.status === 'open').length,
    closed: rows.filter(r => r.status === 'closed').length,
    total: rows.length
  }), [rows]);

  const StatusChip = ({ s }: { s: string }) => (
    <Chip
      label={s === 'open' ? 'Open' : 'Closed'}
      color={s === 'open' ? 'warning' : 'success'}
      size="small"
      variant={s === 'open' ? 'outlined' : 'filled'}
    />
  );

  return (
    <Container sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack spacing={0.5}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ListAltIcon />
            <Typography variant="h4" fontWeight={800}>Orders</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">Track and manage orders</Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(_, v: Filter | null) => v && setFilter(v)}
            size="small"
            color="primary"
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="open">Open</ToggleButton>
            <ToggleButton value="closed">Closed</ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title="Refresh"><span><IconButton onClick={load} disabled={loading}><RefreshIcon /></IconButton></span></Tooltip>
        </Stack>
      </Stack>

      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      {/* Summary */}
      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Stack direction="row" spacing={2} divider={<Divider flexItem orientation="vertical" />} justifyContent="space-between">
          <Stack><Typography color="text.secondary">Open</Typography><Typography variant="h6" fontWeight={900}>{stat.open}</Typography></Stack>
          <Stack><Typography color="text.secondary">Closed</Typography><Typography variant="h6" fontWeight={900}>{stat.closed}</Typography></Stack>
          <Stack><Typography color="text.secondary">Total</Typography><Typography variant="h6" fontWeight={900}>{stat.total}</Typography></Stack>
        </Stack>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={60}>No</TableCell>
              <TableCell>Table</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right" width={120}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton width={24} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell><Skeleton width={60} /></TableCell>
                  <TableCell align="right"><Skeleton width={80} /></TableCell>
                  <TableCell align="right"><Skeleton width={80} /></TableCell>
                </TableRow>
              ))
            ) : list.length ? (
              list.map((r, idx) => (
                <TableRow key={r.id} hover>
                  {/* Gunakan startNo + idx + 1 jika pakai pagination server */}
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>#{r.table?.number ?? r.table_id}</TableCell>
                  <TableCell><StatusChip s={r.status} /></TableCell>
                  <TableCell align="right">{r.total?.toLocaleString('id-ID')}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={()=>nav(`/orders/${r.id}`)}>Detail</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5} align="center">No data</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Orders;
