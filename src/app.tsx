import React from 'react';

import { Outlet } from 'react-router-dom';
import { Navbar } from './components/navbar/navbar';
import { Box } from '@mui/material';
import { InstallProvider } from './contexts/InstallContext';
import { InstallButton } from './components/InstallButton/InstallButton';

export const App: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <InstallProvider>
        <Box sx={{ display: { xs: 'none', sm: 'none', md: 'block' } }}>
          {location.pathname !== '/login' && <Navbar />}
        </Box>
        <Box component="main" sx={{ flexGrow: 1, height: '100dvh' }}>
          <Outlet />
        </Box>
        <Box sx={{ display: { xs: 'block', sm: 'block', md: 'none' } }}>
          <InstallButton variant="fab" />
        </Box>
      </InstallProvider>
    </Box>
  );
};
