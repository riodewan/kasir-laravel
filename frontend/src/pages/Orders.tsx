import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { ApiList, Order } from '../types';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Orders: React.FC = () => {
  const [rows, setRows] = useState<Order[]>([]);
  const nav = useNavigate();

  const load = async () => {
    const res = await api.get('/orders');
    const paged = (res.data?.data as ApiList<Order>) || res.data;
    const data = (paged as any)?.data ?? paged;
    setRows(data);
  };

  useEffect(() => { load(); }, []);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" mb={2}>Orders</Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Table</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>#{r.table?.number ?? r.table_id}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell align="right">{r.total?.toLocaleString()}</TableCell>
                <TableCell align="right">
                  <Button onClick={()=>nav(`/orders/${r.id}`)}>Detail</Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={5}>No data</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Orders;