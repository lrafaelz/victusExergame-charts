import React from 'react';

import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './components/navbar/navbar';
import { Box } from '@mui/material';

export const App: React.FC = () => {
  return (
    <Box sx={{ height: '100dvh' }}>
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        {useLocation().pathname !== '/login' && <Navbar />}
      </Box>
      <Box sx={{ height: '100%' }}>
        <Outlet />
      </Box>
    </Box>
  );
};
