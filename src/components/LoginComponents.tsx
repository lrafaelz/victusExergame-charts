import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Lottie from 'lottie-react';
import { sipinnerLoading } from '../assets';
import Login from '../routes/login';

export const LoginGuard = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }
  return <Login />;
};

export const LoadingSpinner = () => {
  return (
    <Lottie
      animationData={sipinnerLoading}
      loop={true}
      autoplay={true}
      style={{ width: '100%', height: '100%' }}
    />
  );
};
