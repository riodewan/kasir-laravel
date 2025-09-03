import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LandingTables from './pages/LandingTables';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Foods from './pages/Foods';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display:'flex', gap:1 }}>
          <Button color="inherit" component={Link} to="/">Tables</Button>
          {user && <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>}
          {user && <Button color="inherit" component={Link} to="/orders">Orders</Button>}
          {user && <Button color="inherit" component={Link} to="/foods">Foods</Button>}
        </Box>
        <Box>
          {!user ? (
            <Button color="inherit" component={Link} to="/login">Login</Button>
          ) : (
            <>
              <Button disabled color="inherit">{user.role}</Button>
              <Button color="inherit" onClick={logout}>Logout</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <NavBar />
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
    </BrowserRouter>
  );
};

export default App;