import React, { useRef } from 'react';
import {
  Box,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatRounded from '@mui/icons-material/TrendingFlatRounded';
import { PacienteSession } from '../../types/patientData';

interface SessionComparisonProps {
  sessions: PacienteSession[];
}

const SessionComparison: React.FC<SessionComparisonProps> = ({ sessions }) => {
  // Referência para o componente de comparação para exportação PDF
  const comparisonRef = useRef<HTMLDivElement>(null);

  if (!sessions.length) {
    return null;
  }

  // Summary: first and last session
  const first = sessions[0];
  const last = sessions[sessions.length - 1];

  const distanceSummary = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
      <Typography variant="h5" fontWeight="bold">{`${first.distancia}m`}</Typography>
      <TrendingFlatRounded />
      <Typography variant="h5" fontWeight="bold">{`${last.distancia}m`}</Typography>
    </Box>
  );

  const calcAvgSpeed = (session: PacienteSession) => {
    const values = Object.values(session.velocidade);
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  };
  const firstAvg = calcAvgSpeed(first);
  const lastAvg = calcAvgSpeed(last);
  const speedChange = ((lastAvg - firstAvg) / firstAvg) * 100;
  const speedSummary = `${Math.abs(speedChange).toFixed(0)}%`;

  const scoreSummary = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
      <Typography variant="h5" fontWeight="bold">
        {first.pontuacao}
      </Typography>
      <TrendingFlatRounded />
      <Typography variant="h5" fontWeight="bold">
        {last.pontuacao}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', pb: 2 }} ref={comparisonRef} className="session-comparison-container">
      <Typography sx={{ typography: { xs: 'h6', sm: 'h5', md: 'h4' } }} align="center" gutterBottom>
        Comparativo primeira e última sessão
      </Typography>
      {/* Summary below title */}
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        sx={{ my: 3, textAlign: 'center' }}
      >
        <Grid size={{ sm: 4, xs: 12 }}>
          <Typography variant="subtitle2">Distância percorrida</Typography>
          {distanceSummary}
        </Grid>
        <Grid size={{ sm: 4, xs: 12 }}>
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
        <Grid size={{ sm: 4, xs: 12 }}>
          <Typography variant="subtitle2">Pontuação</Typography>
          {scoreSummary}
        </Grid>
      </Grid>

      <Typography variant="body2" color="textDisabled" align="center" gutterBottom>
        Valores capturados durante a sessão com o jogo, obtidos a cada 5 segundos.
      </Typography>
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {sessions.map((session, index) => {
          const intervals = Object.keys(session.velocidade).length;
          const duration = intervals * 5;
          const minutes = Math.floor(duration / 60);
          const seconds = duration % 60;
          const durationFormatted = `${minutes}m ${seconds}s`;

          return (
            <Grid size={{ md: 6, xs: 12 }} key={session.id}>
              <Accordion
                id={`session-accordion-${index}`}
                sx={{
                  boxShadow: 'none',
                  backgroundColor: theme => theme.palette.grey[200],
                  border: theme => `1px solid ${theme.palette.divider}`,
                  '&.Mui-expanded': {
                    backgroundColor: 'inherit',
                  },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{`Sessão ${index + 1} (${session.id})`}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2">Distância: {session.distancia} metros</Typography>
                  <Typography variant="body2">Pontuação: {session.pontuacao}</Typography>
                  <Typography variant="body2" gutterBottom>
                    Duração: {durationFormatted}
                  </Typography>
                  <Typography variant="body2">Parciais:</Typography>

                  <TableContainer
                    component={Paper}
                    sx={{
                      boxShadow: 'none',
                      border: '1px solid #E5E9EB',
                      overflowX: 'auto',
                      width: '100%',
                    }}
                  >
                    <Table
                      sx={{
                        minWidth: 400,
                        width: '100%',
                        '& .MuiTableCell-root': {
                          borderBottom: '1px solid #E5E9EB',
                          padding: { xs: '6px 8px', sm: '8px 16px' },
                          fontSize: { xs: '0.85rem', sm: '1rem' },
                        },
                      }}
                      aria-label={`Tabela Sessão ${index + 1}`}
                    >
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <Typography color="text.disabled">Tempo (s)</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color="text.disabled">BPM</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color="text.disabled">Velocidade</Typography>
                          </TableCell>
                          {/* <TableCell align="right">EMG</TableCell> */}
                        </TableRow>
                        {Object.entries(session.velocidade).map(([timeKey, vel], idx) => (
                          <TableRow key={idx}>
                            <TableCell component="th" scope="row">
                              {timeKey}
                            </TableCell>
                            <TableCell align="right">{session.BPM[Number(timeKey)]}</TableCell>
                            <TableCell align="right">{vel}</TableCell>
                            {/* <TableCell align="right">{session.EMG[Number(timeKey)]}</TableCell> */}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default SessionComparison;
