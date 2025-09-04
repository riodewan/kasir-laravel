import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Paper, Box, TextField, Button, Typography, Alert, Container, Stack,
  InputAdornment, IconButton, Divider, Chip
} from '@mui/material';
// icons
import LoginIcon from '@mui/icons-material/Login';
import KeyIcon from '@mui/icons-material/Key';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useLocation, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation() as any;

  const [email, setEmail] = useState('waiter@test.com');
  const [password, setPassword] = useState('password');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);
      nav(from, { replace: true });
    } catch (error: any) {
      setErr(error?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillWaiter = () => { setEmail('waiter@test.com'); setPassword('password'); };
  const fillCashier = () => { setEmail('cashier@test.com'); setPassword('password'); };

  const canSubmit = email.trim() && password.trim() && !loading;

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 8 }, px: { xs: 2, sm: 0 } }}>
      <Paper sx={{ p: { xs: 3, sm: 4 }, borderRadius: 4 }}>
        {/* Title */}
        <Stack spacing={0.5} mb={2}>
          <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: 22, sm: 28 } }}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary">Sign in to continue</Typography>
        </Stack>

        {err && <Alert severity="error" sx={{ mb: 2 }} role="alert">{err}</Alert>}

        <Box
          component="form"
          onSubmit={onSubmit}
          display="grid"
          gap={2}
          sx={{ mt: 1 }}
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            fullWidth
            autoComplete="username"
            inputMode="email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlineIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Password"
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            fullWidth
            autoComplete="current-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <KeyIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={()=>setShowPw(s=>!s)}
                    aria-label={showPw ? 'hide password' : 'show password'}
                  >
                    {showPw ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            startIcon={<LoginIcon />}
            disabled={!canSubmit}
            sx={{ py: 1.1 }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>

          <Divider flexItem sx={{ my: 1.5 }}>Demo</Divider>

          <Stack
            direction="row"
            spacing={1}
            sx={{ flexWrap: 'wrap', alignItems: 'center', gap: 1 }}
          >
            <Button size="small" onClick={fillWaiter} variant="outlined">Waiter</Button>
            <Button size="small" onClick={fillCashier} variant="outlined">Cashier</Button>
            <Chip size="small" label="password: password" />
          </Stack>

          <Typography variant="caption" color="text.secondary">
            After login you’ll be redirected to your dashboard.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;