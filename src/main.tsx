import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Home } from './routes/home';
import { App } from './app';
import { NotFound } from './routes/notFound';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { ptBR } from '@mui/x-date-pickers/locales';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider';
import { LoginGuard, LoadingSpinner } from './components/LoginComponents';
import moment from 'moment';
import 'moment/locale/pt-br';
moment.locale('pt-br');

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/login',
        element: <LoginGuard />,
        loader: () => <LoadingSpinner />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeContextProvider>
      <LocalizationProvider
        dateAdapter={AdapterMoment}
        adapterLocale="pt-br"
        localeText={{
          ...ptBR.components.MuiLocalizationProvider.defaultProps.localeText,
          cancelButtonLabel: 'Cancelar',
          okButtonLabel: 'OK',
          todayButtonLabel: 'Hoje',
          clearButtonLabel: 'Limpar',
        }}
      >
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </LocalizationProvider>
    </ThemeContextProvider>
  </React.StrictMode>,
);
