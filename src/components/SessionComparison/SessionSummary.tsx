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
  pdfComparisonRef?: React.RefObject<HTMLDivElement>;
  pdfComparisonReady?: boolean;
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  first,
  last,
  speedChange,
  pdfComparisonRef,
  pdfComparisonReady,
}) => {
  const speedSummary = `${Math.abs(speedChange).toFixed(0)}%`;
  const normalComponent = () => {
    return (
      <Box sx={{ width: '100%', overflowX: 'auto', wordBreak: 'break-word', textAlign: 'center' }}>
        <Typography
          sx={{ typography: { xs: 'h6', sm: 'h5', md: 'h4' } }}
          align="center"
          gutterBottom
        >
          Comparativo primeira e última sessão
        </Typography>
        <Grid
          container
          alignItems="center"
          justifyContent="center"
          sx={{ my: 3, textAlign: 'center' }}
        >
          <Grid size={{ xs: 6, sm: 4 }}>
            <Typography variant="subtitle2">Distância percorrida</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Typography variant="h5" fontWeight="bold">{`${first.distancia.toFixed(
                1,
              )}m`}</Typography>
              <TrendingFlatRounded />
              <Typography variant="h5" fontWeight="bold">{`${last.distancia.toFixed(
                1,
              )}m`}</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Typography variant="subtitle2">Velocidade média</Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {speedChange >= 0 ? (
                <TrendingUpIcon color="success" />
              ) : (
                <TrendingDownIcon color="error" />
              )}
              {speedSummary}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: 'center', mt: { xs: 2, sm: 0 } }}>
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
          Valores mensurados durante a sessão com o jogo, obtidos a cada 5 segundos.
        </Typography>
      </Box>
    );
  };

  if (!pdfComparisonReady) return normalComponent();
  else {
    return (
      <div ref={pdfComparisonRef} style={{ width: 1122, height: 439, background: '#fff' }}>
        {normalComponent()}
      </div>
    );
  }
};
