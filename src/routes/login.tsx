import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import db, { auth } from '../firebase';
import { getDoc, doc, setDoc, getCountFromServer, collection } from 'firebase/firestore';
import { logo, sipinnerLoading } from '../assets';
import Lottie from 'lottie-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const { saveUser } = useAuth();

  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const countUsers = async () => {
    const usersRef = collection(db, 'VictusExergame', 'SRF', 'Fisioterapeutas');
    const snapshot = await getCountFromServer(usersRef);
    return snapshot.data().count;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, 'VictusExergame', 'SRF', 'Fisioterapeutas', email);
      const docSnap = await getDoc(userRef);
      saveUser(user);

      const oldHistory =
        docSnap.exists() && Array.isArray(docSnap.data().loginHistory)
          ? docSnap.data().loginHistory
          : [];

      const updatedHistory = [new Date().toISOString(), ...oldHistory].slice(0, 10);

      const userData = {
        email: user.email,
        uid: user.uid,
        loginHistory: updatedHistory,
      };

      if (!userData.email) {
        const amountUsers = await countUsers();
        const userWithoutEmail = 'user_' + (amountUsers + 1).toString();
        userData.email = userWithoutEmail;
      }
      await setDoc(userRef, userData, { merge: true });
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      if (
        firebaseError.code === 'auth/user-not-found' ||
        firebaseError.code === 'auth/wrong-password'
      ) {
        setLoginError('Email ou senha incorretos.');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setLoginError('Formato de email inválido.');
      } else if (firebaseError.code === 'auth/user-disabled') {
        setLoginError('Esta conta foi desativada.');
      } else if (firebaseError.code === 'auth/too-many-requests') {
        setLoginError('Muitas tentativas de login. Tente novamente mais tarde.');
        setLoginError('Muitas tentativas de login. Tente novamente mais tarde.');
      } else {
        setLoginError('Erro ao tentar fazer login. Tente novamente mais tarde.');
      }
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: { xs: 'column', sm: 'row' },
        height: '100%',
        p: '10%',
        gap: 10,
      }}
    >
      <Box
        component="img"
        src={logo}
        alt="VICTUS Logo"
        sx={{
          width: { xs: '90%', sm: '40%' },
        }}
      />

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: '50%', md: '40%' },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography
          textAlign="center"
          sx={{
            typography: { sm: 'h4', md: 'h3', lg: 'h2' },
            mb: 3,
            color: 'primary.main',
            display: { xs: 'none', sm: 'block' },
          }}
        >
          Bem vindo de volta 👋
        </Typography>
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="email-input">E-mail</InputLabel>
          <OutlinedInput
            id="email-input"
            type="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              setLoginError('');
            }}
            required
            label="E-mail"
            error={!!loginError}
          />
        </FormControl>
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="password-input">Senha</InputLabel>
          <OutlinedInput
            id="password-input"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              setLoginError('');
            }}
            required
            error={!!loginError}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? 'ocultar senha' : 'mostrar senha'}
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Senha"
          />
        </FormControl>
        {loginError && (
          <Typography variant="body2" color="error" textAlign="center">
            {loginError}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          loading={loading}
          disabled={loading}
          loadingIndicator={
            <Box sx={{ height: 70, width: 70 }}>
              <Lottie animationData={sipinnerLoading} loop={true} autoplay={true} />
            </Box>
          }
          sx={{
            mt: 2,
            py: 1.2,
            bgcolor: 'primary.main',
            color: 'white',
            fontWeight: 600,
          }}
        >
          Entrar
        </Button>
        <Box
          sx={{
            mt: 2,
            textAlign: 'center',
          }}
        >
          <Typography
            component={Link}
            to="/contact"
            sx={{
              color: 'text.secondary',
              textDecoration: 'none',
              '&:hover': {
                color: 'primary.main',
                textDecoration: 'underline',
              },
              fontSize: '0.9rem',
            }}
          >
            Não possuí conta? Solicite a criação de sua conta
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
