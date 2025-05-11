import React, { useMemo } from 'react';
import { createContext, useContext, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import generateTheme from '../theme';
import { ThemeColors, defaultThemeColors } from './themeContextTypes';

const ThemeContext = createContext<{
  themeColors: ThemeColors;
  setThemeColors: React.Dispatch<React.SetStateAction<ThemeColors>>;
}>({
  themeColors: defaultThemeColors,
  setThemeColors: () => {
    console.warn('setThemeColors foi chamado fora do ThemeContextProvider.');
  },
});

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeColors, setThemeColors] = useState<ThemeColors>({
    primary: '#f47619',
    secondary: '#F69045',
    dark: '#d66817',
  });

  // Recalcula o tema sempre que as cores mudam
  const theme = useMemo(() => generateTheme(themeColors), [themeColors]);

  return (
    <ThemeContext.Provider value={{ themeColors, setThemeColors }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};
