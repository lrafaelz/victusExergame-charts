import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import TrendingFlatRounded from '@mui/icons-material/TrendingFlatRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { PacienteSession } from '../../types/patientData';

interface SessionSummaryProps {
  first: PacienteSession;
  last: PacienteSession;
  speedChange: number;
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({ first, last, speedChange }) => {
  const speedSummary = `${Math.abs(speedChange).toFixed(0)}%`;

  return (
    <>
      <Typography sx={{ typography: { xs: 'h6', sm: 'h5', md: 'h4' } }} align="center" gutterBottom>
        Comparativo primeira e última sessão
      </Typography>
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        sx={{ my: 3, textAlign: 'center' }}
      >
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle2">Distância percorrida</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Typography variant="h5" fontWeight="bold">{`${first.distancia}m`}</Typography>
            <TrendingFlatRounded />
            <Typography variant="h5" fontWeight="bold">{`${last.distancia}m`}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle2">Velocidade média</Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {speedChange >= 0 ? (
              <TrendingUpIcon color={speedChange >= 0 ? 'success' : 'error'} />
            ) : (
              <TrendingDownIcon color={speedChange >= 0 ? 'success' : 'error'} />
            )}
            {speedSummary}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle2">Pontuação</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Typography variant="h5" fontWeight="bold">
              {first.pontuacao}
            </Typography>
            <TrendingFlatRounded />
            <Typography variant="h5" fontWeight="bold">
              {last.pontuacao}
            </Typography>
          </Box>
        </Grid>
      </Grid>
      <Typography variant="body2" color="textDisabled" align="center" gutterBottom>
        Valores capturados durante a sessão com o jogo, obtidos a cada 5 segundos.
      </Typography>
    </>
  );
};
