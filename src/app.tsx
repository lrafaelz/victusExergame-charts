import React from "react";

import { Outlet } from "react-router-dom";
import { NavbarVicuts } from "./components/navbarVictus";
import { Box } from "@mui/material";
import { ThemeContextProvider } from "./contexts/ThemeContext";

export const App: React.FC = () => {
  return (
    <ThemeContextProvider>
      <NavbarVicuts />
      <Box sx={{ py: 5 }}>
        <Outlet />
      </Box>
    </ThemeContextProvider>
  );
};
