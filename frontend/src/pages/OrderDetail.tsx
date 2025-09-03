import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import type { Food, Order, OrderItem } from '../types';
import { useParams } from 'react-router-dom';
import {
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Stack, Button, Alert, TextField, MenuItem
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material'; // 👈 Grid v1 alias
import RoleGuard from '../components/RoleGuard';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const [order, setOrder] = useState<Order | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [foodId, setFoodId] = useState<number | ''>('');
  const [qty, setQty] = useState<number>(1);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setErr(null);
    try {
      const [oRes, fRes] = await Promise.all([
        api.get(`/orders/${orderId}`),
        api.get('/foods')
      ]);
      setOrder(oRes.data?.data ?? oRes.data);
      const list = fRes.data?.data?.data || fRes.data?.data || fRes.data;
      setFoods(list);
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Failed to load order');
    }
  };

  useEffect(() => { load(); }, [orderId]);

  const canAdd = useMemo<boolean>(
    () => Boolean(order && order.status === 'open' && foodId && qty > 0),
    [order, foodId, qty]
  );

  const addItem = async () => {
    if (!canAdd) return;
    try {
      await api.post(`/orders/${orderId}/items`, { food_id: foodId, quantity: qty });
      setFoodId('');
      setQty(1);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Failed to add item');
    }
  };

  const closeOrder = async () => {
    try {
      await api.post(`/orders/${orderId}/close`);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Failed to close order');
    }
  };

  const downloadReceipt = () => {
    window.open(`${import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '')}/api/orders/${orderId}/receipt`, '_blank');
  };

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Order #{orderId}</Typography>
        <Stack direction="row" spacing={1}>
          <RoleGuard allow={['cashier']}>
            <Button variant="outlined" onClick={downloadReceipt} disabled={order?.status !== 'closed'}>
              Receipt PDF
            </Button>
          </RoleGuard>
          <RoleGuard allow={['waiter','cashier']}>
            <Button variant="contained" color="success" onClick={closeOrder} disabled={order?.status !== 'open'}>
              Close Order
            </Button>
          </RoleGuard>
        </Stack>
      </Stack>

      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      <Paper sx={{ p: 2, borderRadius: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}><Typography>Table: #{order?.table?.number ?? order?.table_id}</Typography></Grid>
          <Grid item xs={12} sm={4}><Typography>Status: {order?.status}</Typography></Grid>
          <Grid item xs={12} sm={4}><Typography>Total: {order?.total?.toLocaleString()}</Typography></Grid>
        </Grid>
      </Paper>

      <RoleGuard allow={['waiter']}>
        <Paper sx={{ p: 2, borderRadius: 3, mb: 3 }}>
          <Typography variant="h6" mb={2}>Add Item</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Food"
              select
              value={foodId}
              onChange={(e)=>setFoodId(Number(e.target.value))}
              sx={{ minWidth: 240 }}
            >
              {foods.map(f => (
                <MenuItem key={f.id} value={f.id}>
                  {f.name} — {f.price.toLocaleString()}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Quantity"
              type="number"
              value={qty}
              onChange={(e)=>setQty(Number(e.target.value))}
              sx={{ width: 160 }}
              inputProps={{ min: 1 }}
            />
            <Button variant="contained" onClick={addItem} disabled={!canAdd}>
              Add
            </Button>
          </Stack>
        </Paper>
      </RoleGuard>

      <Typography variant="h6" mb={1}>Items</Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Food</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Subtotal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order?.items?.map((it: OrderItem) => (
              <TableRow key={it.id}>
                <TableCell>{it.food?.name}</TableCell>
                <TableCell align="right">{it.quantity}</TableCell>
                <TableCell align="right">{it.price.toLocaleString()}</TableCell>
                <TableCell align="right">{(it.quantity * it.price).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {(!order?.items || order.items.length === 0) && (
              <TableRow><TableCell colSpan={4}>No items</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default OrderDetail;