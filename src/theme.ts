import { createTheme } from '@mui/material/styles';
import { ptBR } from '@mui/x-date-pickers/locales';
import { ThemeColors } from './contexts/themeContextTypes';

const colors = {
  text: '#373435',
};

const generateTheme = (themeColors: ThemeColors) => {
  return createTheme(
    {
      palette: {
        primary: {
          main: themeColors.primary,
          light: '#f69045',
          dark: themeColors.dark,
          contrastText: '#ffffff',
        },
        secondary: {
          main: themeColors.secondary,
          light: '#fac49c',
          dark: '#d99060',
          contrastText: '#ffffff',
        },
        background: {
          default: '#fffffe',
          paper: '#ffffff',
        },
        divider: '#d9d9d9',
        text: {
          primary: colors.text,
          secondary: '#333333',
          disabled: '#6e7c87',
        },
      },
      typography: {
        fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
        allVariants: {
          color: colors.text,
        },
        button: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              padding: '8px 16px',
              '&:hover': {
                backgroundColor: '#f69045',
              },
            },
            containedPrimary: {
              '&:hover': {
                backgroundColor: '#f69045',
              },
            },
          },
        },
      },
    },
    ptBR,
  );
};

export default generateTheme;
