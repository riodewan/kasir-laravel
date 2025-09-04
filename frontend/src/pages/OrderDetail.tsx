import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import type { Food, Order, OrderItem } from '../types';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Paper, Stack, Button, Alert, TextField, Chip, Box,
  Divider, IconButton, InputAdornment, Tabs, Tab, Card, CardContent, Tooltip, Skeleton
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddRounded from '@mui/icons-material/AddRounded';
import RemoveRounded from '@mui/icons-material/RemoveRounded';
import PrintRounded from '@mui/icons-material/PrintRounded';
import SaveAltRounded from '@mui/icons-material/SaveAltRounded';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import RoleGuard from '../components/RoleGuard';
import { useAuth } from '../context/AuthContext';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const nav = useNavigate();

  const { user } = useAuth();
  const isWaiter = user?.role === 'waiter';
  const isCashier = user?.role === 'cashier';

  const [order, setOrder] = useState<Order | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<string>('All');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFoods = useCallback(async () => {
    if (!isWaiter) { setFoods([]); return; }
    try {
      const fRes = await api.get('/foods');
      const list = fRes.data?.data?.data || fRes.data?.data || fRes.data;
      setFoods(list);
    } catch {
      setFoods([]);
    }
  }, [isWaiter]);

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      const oRes = await api.get(`/orders/${orderId}`);
      setOrder(oRes.data?.data ?? oRes.data);
      await fetchFoods();
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [orderId, fetchFoods]);

  useEffect(() => { load(); }, [load]);

  // Kategori + filter katalog
  const categories = useMemo(() => {
    const set = new Set<string>();
    foods.forEach(f => f.category && set.add(f.category));
    return ['All', ...Array.from(set)];
  }, [foods]);

  const filteredFoods = useMemo(() => {
    const qn = q.trim().toLowerCase();
    return foods.filter(f => {
      const matchTab = tab === 'All' ? true : (f.category === tab);
      const matchQ = !qn || f.name.toLowerCase().includes(qn) || (f.category ?? '').toLowerCase().includes(qn);
      return matchTab && matchQ;
    });
  }, [foods, q, tab]);

  // === Grouping item berdasarkan food + price (aman untuk variasi snapshot harga) ===
  type Grouped = { food: Food; quantity: number; price: number };
  const groupedItems: Grouped[] = useMemo(() => {
    const map = new Map<string, Grouped>();
    for (const it of (order?.items ?? [] as OrderItem[])) {
      const fid = (it.food?.id as number) ?? (it as any).food_id;
      const price = it.price;
      const key = `${fid}-${price}`;
      const prev = map.get(key);
      if (prev) {
        prev.quantity += it.quantity;
      } else {
        map.set(key, {
          food: (it.food as Food) ?? ({ id: fid, name: 'Item' } as any),
          quantity: it.quantity,
          price
        });
      }
    }
    return Array.from(map.values());
  }, [order]);

  const addItem = useCallback(async (foodId: number) => {
    if (!order || order.status !== 'open') return;
    try {
      await api.post(`/orders/${orderId}/items`, { food_id: foodId, quantity: 1 });
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Failed to add item');
    }
  }, [order, orderId, load]);

  const closeOrder = useCallback(async () => {
    try {
      await api.post(`/orders/${orderId}/close`);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Failed to close order');
    }
  }, [orderId, load]);

  const downloadReceipt = useCallback(() => {
    window.open(`${import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '')}/api/orders/${orderId}/receipt`, '_blank');
  }, [orderId]);

  const total = useMemo(
    () => (order?.items ?? []).reduce((s, it) => s + it.quantity * it.price, 0),
    [order]
  );

  const goBack = useCallback(() => {
    // Coba kembali 1 langkah; jika tidak ada history, fallback ke /orders
    if (window.history.length > 1) nav(-1);
    else nav('/orders');
  }, [nav]);

  return (
    <Container sx={{ py: { xs: 2.5, sm: 4 } }}>
      {/* Header */}
      <Stack
        direction={{ xs:'column', sm:'row' }}
        justifyContent="space-between"
        alignItems={{ xs:'flex-start', sm:'center' }}
        mb={2}
        gap={2}
        sx={{ flexWrap: 'wrap' }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: 22, sm: 28 } }}>
            {loading && !order ? 'Loading…' : <>Table #{order?.table?.number ?? order?.table_id ?? orderId}</>}
          </Typography>
          {order && (
            <Chip
              size="small"
              label={order.status === 'open' ? 'Open' : 'Closed'}
              color={order.status === 'open' ? 'warning' : 'success'}
              variant={order.status === 'open' ? 'outlined' : 'filled'}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Button
            startIcon={<ArrowBackRounded />}
            onClick={goBack}
            variant="outlined"
            aria-label="Back to orders"
          >
            Back
          </Button>

          <RoleGuard allow={['cashier']}>
            <Button
              startIcon={<PrintRounded />}
              variant="outlined"
              onClick={downloadReceipt}
              disabled={order?.status !== 'closed'}
              aria-label="Print receipt"
            >
              Print Bill
            </Button>
          </RoleGuard>
          <RoleGuard allow={['waiter','cashier']}>
            <Button
              variant="contained"
              color="success"
              onClick={closeOrder}
              disabled={order?.status !== 'open'}
            >
              {isCashier ? 'Close Order' : 'Send / Close'}
            </Button>
          </RoleGuard>
        </Stack>
      </Stack>

      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      <Grid container spacing={2}>
        {/* LEFT: Menu & catalog (waiter only) */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            {isWaiter ? (
              <>
                <Tabs
                  value={tab}
                  onChange={(_, v) => setTab(v)}
                  variant="scrollable"
                  allowScrollButtonsMobile
                  aria-label="Menu categories"
                >
                  {categories.map(c => <Tab key={c} label={c} value={c} />)}
                </Tabs>

                <Stack direction="row" alignItems="center" gap={1.5} mt={2} mb={1.5} sx={{ flexWrap: 'wrap' }}>
                  <TextField
                    placeholder="Search menu…"
                    size="small"
                    value={q}
                    onChange={(e)=>setQ(e.target.value)}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      'aria-label': 'Search menu items'
                    }}
                  />
                </Stack>

                <Grid container spacing={1.5}>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <Grid key={i} item xs={12}>
                        <Card sx={{ borderRadius: 2, p: 1.5 }}>
                          <Skeleton width="40%" /><Skeleton width="20%" /><Skeleton width="30%" />
                        </Card>
                      </Grid>
                    ))
                  ) : filteredFoods.length ? (
                    filteredFoods.map(f => (
                      <Grid key={f.id} item xs={12}>
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                          <CardContent sx={{ py: 1.25, '&:last-child':{ pb: 1.25 } }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
                              <Box>
                                <Typography fontWeight={700}>{f.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{f.category || '—'}</Typography>
                              </Box>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography fontWeight={800}>{f.price.toLocaleString('id-ID')}</Typography>
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={()=>addItem(f.id)}
                                  disabled={order?.status !== 'open'}
                                  aria-label={`Add ${f.name}`}
                                >
                                  Add
                                </Button>
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Box textAlign="center" py={4} color="text.secondary">No menu items</Box>
                    </Grid>
                  )}
                </Grid>
              </>
            ) : (
              <Box textAlign="center" py={6} color="text.secondary">
                Catalog is available for waiter role.
              </Box>
            )}
          </Paper>
        </Grid>

        {/* RIGHT: Current order (sticky on desktop) */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, borderRadius: 3, position: { md: 'sticky' }, top: { md: 16 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontWeight={800}>Current Order</Typography>
              <Chip size="small" label={`#${orderId}`} />
            </Stack>
            <Divider sx={{ my: 1.5 }} />

            <Stack spacing={1.25}>
              {loading ? (
                Array.from({ length: 3 }).map((_, i)=>(
                  <Card key={i} sx={{ borderRadius: 2, p: 1.25 }}>
                    <Skeleton width="70%" />
                  </Card>
                ))
              ) : (groupedItems.length ? (
                groupedItems.map((gi) => (
                  <Card key={`${gi.food.id}-${gi.price}`} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ py: 1.25, '&:last-child':{ pb: 1.25 } }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
                        <Box>
                          <Typography fontWeight={700}>{gi.food.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {gi.price.toLocaleString('id-ID')}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {/* Minus masih disabled karena backend belum ada endpoint pengurangan */}
                          <Tooltip title="Decrease (not available)">
                            <span>
                              <IconButton size="small" disabled aria-label="Decrease quantity">
                                <RemoveRounded fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Typography fontWeight={700}>{gi.quantity}</Typography>

                          <RoleGuard allow={['waiter']}>
                            <Tooltip title="Add one">
                              <IconButton
                                size="small"
                                onClick={()=>addItem(gi.food.id)}
                                disabled={order?.status !== 'open'}
                                aria-label="Increase quantity"
                              >
                                <AddRounded fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </RoleGuard>

                          <Typography width={90} textAlign="right" fontWeight={800}>
                            {(gi.quantity * gi.price).toLocaleString('id-ID')}
                          </Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Box textAlign="center" py={4} color="text.secondary">No items</Box>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography color="text.secondary">Total</Typography>
              <Typography variant="h6" fontWeight={900}>{total.toLocaleString('id-ID')}</Typography>
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Stack direction={{ xs:'column', sm:'row' }} spacing={1}>
              <Button startIcon={<SaveAltRounded />} disabled aria-label="Save draft">Save Draft</Button>
              <RoleGuard allow={['cashier']}>
                <Button
                  startIcon={<PrintRounded />}
                  variant="outlined"
                  onClick={downloadReceipt}
                  disabled={order?.status !== 'closed'}
                >
                  Print Bill
                </Button>
              </RoleGuard>
              <RoleGuard allow={['waiter','cashier']}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={closeOrder}
                  disabled={order?.status !== 'open'}
                >
                  {isCashier ? 'Close Order' : 'Send / Close'}
                </Button>
              </RoleGuard>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderDetail;