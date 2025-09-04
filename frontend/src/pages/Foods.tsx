import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import type { Food } from '../types';
import {
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert,
  IconButton, InputAdornment, Tooltip, Box, Skeleton, Divider, Card, CardContent, Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import RoleGuard from '../components/RoleGuard';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const Foods: React.FC = () => {
  const [rows, setRows] = useState<Food[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Food | null>(null);
  const [form, setForm] = useState<Partial<Food>>({ name: '', price: 0, category: '' });
  const [q, setQ] = useState('');

  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down('sm'));
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const load = async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await api.get('/foods');
      const data = res.data?.data?.data || res.data?.data || res.data;
      setRows(data);
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Failed to fetch foods');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const qn = q.trim().toLowerCase();
    if (!qn) return rows;
    return rows.filter(r =>
      r.name.toLowerCase().includes(qn) ||
      (r.category ?? '').toLowerCase().includes(qn)
    );
  }, [rows, q]);

  // Urutkan terbaru dulu (created_at desc; fallback id desc)
  const list = useMemo(() => {
    const getTime = (x: any) => (x?.created_at ? new Date(x.created_at).getTime() : 0);
    return [...filtered].sort((a, b) => {
      const t = getTime(b) - getTime(a);
      return t !== 0 ? t : (Number(b.id) - Number(a.id));
    });
  }, [filtered]);

  const openCreate = () => { setEditing(null); setForm({ name: '', price: 0, category: '' }); setOpen(true); };
  const openEdit = (row: Food) => { setEditing(row); setForm(row); setOpen(true); };

  const submit = async () => {
    try {
      if (!form.name) return setErr('Name is required');
      if (Number(form.price) < 0) return setErr('Price must be ≥ 0');

      if (editing) {
        await api.put(`/foods/${editing.id}`, { name: form.name, price: Number(form.price), category: form.category });
      } else {
        await api.post('/foods', { name: form.name, price: Number(form.price), category: form.category });
      }
      setOpen(false);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this food?')) return;
    try { await api.delete(`/foods/${id}`); await load(); }
    catch (e: any) { setErr(e?.response?.data?.message || 'Delete failed'); }
  };

  return (
    <Container sx={{ py: { xs: 2.5, sm: 4 } }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        sx={{ flexWrap: 'wrap', gap: 1 }}
      >
        <Stack spacing={0.5}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <RestaurantMenuIcon />
            <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: 22, sm: 28 } }}>
              Menu Management
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">Manage menu items and pricing</Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          <TextField
            size="small"
            placeholder="Search name or category…"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            sx={{ width: { xs: '100%', sm: 280 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              'aria-label': 'Search foods'
            }}
          />
          <Tooltip title="Refresh">
            <span><IconButton onClick={load} disabled={loading}><RefreshIcon /></IconButton></span>
          </Tooltip>
          <RoleGuard allow={['waiter']}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              Add Food
            </Button>
          </RoleGuard>
        </Stack>
      </Stack>

      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      {/* ===== Content: TABLE (mdUp) / CARDS (smDown) ===== */}
      {mdUp ? (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell width={60}>No</TableCell>
                  <TableCell width="40%">Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right" width={140}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton width={24} /></TableCell>
                      <TableCell><Skeleton width="60%" /></TableCell>
                      <TableCell><Skeleton width="40%" /></TableCell>
                      <TableCell align="right"><Skeleton width={80} /></TableCell>
                      <TableCell align="right"><Skeleton width={120} /></TableCell>
                    </TableRow>
                  ))
                ) : list.length ? (
                  list.map((r, idx) => (
                    <TableRow key={r.id} hover>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell><Typography fontWeight={600}>{r.name}</Typography></TableCell>
                      <TableCell>{r.category || '-'}</TableCell>
                      <TableCell align="right">{r.price.toLocaleString('id-ID')}</TableCell>
                      <TableCell align="right">
                        <RoleGuard allow={['waiter']}>
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => openEdit(r)}><EditIcon fontSize="small" /></IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error" onClick={() => remove(r.id)}><DeleteOutlineIcon fontSize="small" /></IconButton>
                            </Tooltip>
                          </Stack>
                        </RoleGuard>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={5} align="center">No data</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </TableContainer>
      ) : (
        <Stack spacing={1.25}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Skeleton width="55%" />
                  <Skeleton width="35%" />
                  <Skeleton width="25%" />
                </CardContent>
              </Card>
            ))
          ) : list.length ? (
            list.map((r, idx) => (
              <Card key={r.id} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" color="text.secondary">No</Typography>
                    <Typography fontWeight={800}>{idx + 1}</Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center" mt={0.5}>
                    <Typography color="text.secondary">Name</Typography>
                    <Typography fontWeight={700}>{r.name}</Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center" mt={0.5}>
                    <Typography color="text.secondary">Category</Typography>
                    <Chip size="small" label={r.category || '-'} />
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center" mt={0.5} mb={1}>
                    <Typography color="text.secondary">Price</Typography>
                    <Typography fontWeight={800}>{r.price.toLocaleString('id-ID')}</Typography>
                  </Stack>

                  <RoleGuard allow={['waiter']}>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" variant="outlined" onClick={() => openEdit(r)} startIcon={<EditIcon fontSize="small" />}>
                        Edit
                      </Button>
                      <Button size="small" color="error" variant="outlined" onClick={() => remove(r.id)} startIcon={<DeleteOutlineIcon fontSize="small" />}>
                        Delete
                      </Button>
                    </Stack>
                  </RoleGuard>
                </CardContent>
              </Card>
            ))
          ) : (
            <Box textAlign="center" py={6} color="text.secondary">No data</Box>
          )}
        </Stack>
      )}

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Food' : 'Add Food'}</DialogTitle>
        <DialogContent sx={{ display:'grid', gap:2, mt:1 }}>
          <TextField
            label="Name"
            value={form.name ?? ''}
            onChange={(e)=>setForm(s=>({...s, name:e.target.value}))}
            autoFocus
            fullWidth
          />
          <TextField
            label="Category"
            value={form.category ?? ''}
            onChange={(e)=>setForm(s=>({...s, category:e.target.value}))}
            fullWidth
          />
          <TextField
            label="Price"
            type="number"
            value={form.price ?? 0}
            onChange={(e)=>setForm(s=>({...s, price:Number(e.target.value)}))}
            inputProps={{ min: 0 }}
            fullWidth
          />
          <Divider />
          <Typography variant="caption" color="text.secondary">
            Make sure the name is unique.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={()=>setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Foods;