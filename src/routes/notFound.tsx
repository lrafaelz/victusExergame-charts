import { Box, Link, Typography } from '@mui/material';
import Lottie from 'lottie-react';
import { NotFoundAnimation } from '../assets';

export const NotFound = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Altura total da tela
        width: '100%', // Largura total
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '40%',
          height: '40%',
        }}
      >
        <Lottie
          animationData={NotFoundAnimation}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      </Box>

      <Typography
        color="textDisabled"
        sx={{
          fontSize: {
            xs: '1.4rem',
            sm: '1.6rem',
            md: '2.15rem',
            lg: '2.5rem',
          },
        }}
      >
        Página não encontrada.
      </Typography>
      <Link href="/" underline="hover">
        <Typography color="textDisabled" sx={{ fontSize: '1.5rem', mt: 2 }}>
          Voltar para o início
        </Typography>
      </Link>
    </Box>
  );
};
