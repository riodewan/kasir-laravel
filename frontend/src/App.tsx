import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Button, Box, Typography, Avatar, Chip, Container, IconButton, Stack
} from '@mui/material';
import MenuRounded from '@mui/icons-material/MenuRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import RoleGuard from './components/RoleGuard';
import LandingTables from './pages/LandingTables';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Foods from './pages/Foods';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const [open, setOpen] = React.useState(false);

  const isActive = (to: string) => loc.pathname === to;

  const NavButton = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Button
      color="inherit"
      component={Link}
      to={to}
      onClick={() => setOpen(false)}
      sx={{
        opacity: isActive(to) ? 1 : 0.9,
        fontWeight: isActive(to) ? 800 : 600,
        textTransform: 'none',
        '&:hover': { opacity: 1 }
      }}
    >
      {children}
    </Button>
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        mt: 2,
        mx: 'auto',
        width: { xs: '100%', sm: '95%' },
        borderRadius: 3,
        backdropFilter: 'blur(6px)',
        background: (t) => `linear-gradient(90deg, ${t.palette.primary.main} 0%, ${t.palette.primary.dark} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ gap: 1, minHeight: 64 }}>
          <Typography
            component={Link}
            to="/"
            color="inherit"
            sx={{ textDecoration: 'none', fontWeight: 900, mr: 1.5, letterSpacing: .2 }}
          >
            🍽️ RestoPOS
          </Typography>

          {/* Desktop nav */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
            <NavButton to="/">Tables</NavButton>
            {user && <NavButton to="/dashboard">Dashboard</NavButton>}
            {user && <NavButton to="/orders">Orders</NavButton>}
            <RoleGuard allow={['waiter']}>
              <NavButton to="/foods">Foods</NavButton>
            </RoleGuard>
          </Box>

          {/* User area */}
          <Stack direction="row" alignItems="center" gap={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {!user ? (
              <Button color="inherit" component={Link} to="/login" variant="outlined" sx={{ textTransform: 'none' }}>
                Login
              </Button>
            ) : (
              <>
                <Chip size="small" label={user.role} color="default" sx={{ bgcolor: 'rgba(255,255,255,.2)', color: '#fff' }} />
                <Avatar sx={{ width: 28, height: 28, bgcolor: 'rgba(255,255,255,.25)' }}>
                  {user.name?.[0]?.toUpperCase() ?? 'U'}
                </Avatar>
                <Button color="inherit" onClick={logout} variant="outlined" sx={{ textTransform: 'none' }}>
                  Logout
                </Button>
              </>
            )}
          </Stack>

          {/* Mobile toggler */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 'auto' }}>
            <IconButton color="inherit" onClick={() => setOpen(s => !s)} aria-label="toggle menu">
              {open ? <CloseRounded /> : <MenuRounded />}
            </IconButton>
          </Box>
        </Toolbar>

        {/* Mobile drop menu */}
        {open && (
          <Stack
            spacing={0.5}
            sx={{
              display: { xs: 'flex', md: 'none' },
              pb: 2,
            }}
          >
            <NavButton to="/">Tables</NavButton>
            {user && <NavButton to="/dashboard">Dashboard</NavButton>}
            {user && <NavButton to="/orders">Orders</NavButton>}
            <RoleGuard allow={['waiter']}><NavButton to="/foods">Foods</NavButton></RoleGuard>

            {!user ? (
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                color="inherit"
                sx={{ textTransform: 'none', mt: .5 }}
                onClick={() => setOpen(false)}
              >
                Login
              </Button>
            ) : (
              <Stack direction="row" alignItems="center" gap={1} mt={1}>
                <Chip size="small" label={user.role} sx={{ bgcolor: 'rgba(255,255,255,.2)', color: '#fff' }} />
                <Avatar sx={{ width: 28, height: 28, bgcolor: 'rgba(255,255,255,.25)' }}>
                  {user.name?.[0]?.toUpperCase() ?? 'U'}
                </Avatar>
                <Button color="inherit" onClick={logout} variant="outlined" sx={{ textTransform: 'none', ml: 'auto' }}>
                  Logout
                </Button>
              </Stack>
            )}
          </Stack>
        )}
      </Container>
    </AppBar>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <NavBar />
    <Container maxWidth="lg" sx={{ pb: 6 }}>
      <Routes>
        <Route path="/" element={<LandingTables />} />
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/foods" element={<Foods />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
        </Route>
      </Routes>
    </Container>
  </BrowserRouter>
);

export default App;