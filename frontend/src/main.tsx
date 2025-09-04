import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material';
import App from './App';
import { AuthProvider } from './context/AuthContext';

let theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1f7a8c' },
    secondary: { main: '#ef476f' },
    background: { default: '#f7f9fb', paper: '#ffffff' },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 16 } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, borderRadius: 12 } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 20 } } },
    MuiAppBar: { styleOverrides: { root: { borderRadius: 20 } } },
  },
});
theme = responsiveFontSizes(theme);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);