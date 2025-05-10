import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useLoginGuard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const shouldRedirect = () => {
    if (user) {
      navigate('/', { replace: true });
      return true;
    }
    return false;
  };

  return {
    user,
    shouldRedirect,
  };
};
