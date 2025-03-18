import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './components/routes/AppRoutes';
import { AuthProvider } from './components/context/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import theme from './components/styles/theme';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
