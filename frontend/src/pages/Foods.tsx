import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { Food } from '../types';
import {
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert
} from '@mui/material';
import RoleGuard from '../components/RoleGuard';

const Foods: React.FC = () => {
  const [rows, setRows] = useState<Food[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Food | null>(null);
  const [form, setForm] = useState<Partial<Food>>({ name: '', price: 0, category: '' });

  const load = async () => {
    setErr(null);
    try {
      const res = await api.get('/foods');
      const data = res.data?.data?.data || res.data?.data || res.data;
      setRows(data);
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Failed to fetch foods');
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', price: 0, category: '' }); setOpen(true); };
  const openEdit = (row: Food) => { setEditing(row); setForm(row); setOpen(true); };

  const submit = async () => {
    try {
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
    <Container sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Foods</Typography>
        <RoleGuard allow={['waiter','cashier']}>
          <Button variant="contained" onClick={openCreate}>Add Food</Button>
        </RoleGuard>
      </Stack>
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.category}</TableCell>
                <TableCell align="right">{r.price.toLocaleString()}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" onClick={() => openEdit(r)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => remove(r.id)}>Delete</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={4}>No data</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Food' : 'Add Food'}</DialogTitle>
        <DialogContent sx={{ display:'grid', gap:2, mt:1 }}>
          <TextField label="Name" value={form.name ?? ''} onChange={(e)=>setForm(s=>({...s, name:e.target.value}))} />
          <TextField label="Category" value={form.category ?? ''} onChange={(e)=>setForm(s=>({...s, category:e.target.value}))} />
          <TextField label="Price" type="number" value={form.price ?? 0} onChange={(e)=>setForm(s=>({...s, price:Number(e.target.value)}))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Foods;