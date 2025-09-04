import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box, Typography, Avatar, Chip, Container } from '@mui/material';
import { useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import RoleGuard from './components/RoleGuard';
import LandingTables from './pages/LandingTables';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Foods from './pages/Foods';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';

const Nav: React.FC = () => {
  const { user, logout } = useAuth();
  const loc = useLocation();

  const NavButton = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Button
      color="inherit"
      component={Link}
      to={to}
      sx={{
        opacity: loc.pathname === to ? 1 : 0.8,
        fontWeight: loc.pathname === to ? 700 : 500,
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
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <Typography component={Link} to="/" color="inherit" sx={{ textDecoration: 'none', fontWeight: 800, mr: 1.5 }}>
          🍽️ RestoPOS
        </Typography>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 0.5 }}>
          <NavButton to="/">Tables</NavButton>
          {user && <NavButton to="/dashboard">Dashboard</NavButton>}
          {user && <NavButton to="/orders">Orders</NavButton>}
          <RoleGuard allow={['waiter']}>
            <NavButton to="/foods">Foods</NavButton>
          </RoleGuard>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!user ? (
            <Button color="inherit" component={Link} to="/login" variant="outlined">
              Login
            </Button>
          ) : (
            <>
              <Chip size="small" label={user.role} color="default" />
              <Avatar sx={{ width: 28, height: 28 }}>{user.name?.[0]?.toUpperCase() ?? 'U'}</Avatar>
              <Button color="inherit" onClick={logout} variant="outlined">Logout</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <Nav />
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