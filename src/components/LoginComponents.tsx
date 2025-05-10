import React from 'react';
import Lottie from 'lottie-react';
import { sipinnerLoading } from '../assets';
import Login from '../routes/login';
import { useLoginGuard } from './LoginComponents.functions';

export const LoginGuard: React.FC = () => {
  const { shouldRedirect } = useLoginGuard();

  if (shouldRedirect()) {
    return null;
  }
  return <Login />;
};

export const LoadingSpinner: React.FC = () => {
  return (
    <Lottie
      animationData={sipinnerLoading}
      loop={true}
      autoplay={true}
      style={{ width: '100%', height: '100%' }}
    />
  );
};
