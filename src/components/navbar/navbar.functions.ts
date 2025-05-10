import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const useNavbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    Promise.resolve(logout()).then(() => {
      navigate('/login');
    });
  };

  return {
    user,
    onLogout,
  };
};
