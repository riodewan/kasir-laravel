import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Paper, Box, TextField, Button, Typography, Alert, Container } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation() as any;
  const [email, setEmail] = useState('waiter@test.com');
  const [password, setPassword] = useState('password');
  const [err, setErr] = useState<string | null>(null);
  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await login(email, password);
      nav(from, { replace: true });
    } catch (error: any) {
      setErr(error?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" mb={2}>Login</Typography>
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
        <Box component="form" onSubmit={onSubmit} display="grid" gap={2}>
          <TextField label="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <TextField label="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <Button type="submit" variant="contained">Sign in</Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;