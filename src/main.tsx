import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Home } from './routes/home';
import { App } from './app';
import { SessionsChart } from './routes/sessionsChart';
import { NotFound } from './routes/notFound';
import Login from './routes/login';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Lottie from 'lottie-react';

import { sipinnerLoading } from './assets';

// Import useNavigate hook at the top

// Auth guard component
const LoginGuard = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }
  return <Login />;
};

const LoadingSpinner = () => {
  return (
    <Lottie
      animationData={sipinnerLoading}
      loop={true}
      autoplay={true}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

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
        path: '/graficos',
        element: <SessionsChart />,
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
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeContextProvider>
  </React.StrictMode>,
);
