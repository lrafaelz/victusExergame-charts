import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

export const Home = () => {
  const handleIndividualSessions = () => {
    navigate('/graficos');
  };

  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        p: 5,
        gap: 3,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
        Selecione uma das opções abaixo
      </Typography>
      <Button
        variant="contained"
        onClick={handleIndividualSessions}
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          px: 4,
          py: 1,
          borderRadius: 1,
          width: 240,
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
        }}
      >
        Gerar gráficos a partir das sessões
      </Button>
    </Box>
  );
};
