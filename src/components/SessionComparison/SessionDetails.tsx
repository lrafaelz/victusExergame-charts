import React from 'react';
import {
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { PacienteSession } from '../../types/patientData';

interface SessionDetailsProps {
  sessions: PacienteSession[];
}

export const SessionDetails: React.FC<SessionDetailsProps> = ({ sessions }) => {
  return (
    <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
      {sessions.map((session, index) => {
        const intervals = Object.keys(session.velocidade).length;
        const duration = intervals * 5;
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        const durationFormatted = `${minutes}m ${seconds}s`;

        return (
          <Grid size={{ xs: 12, md: 6 }} key={session.id}>
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
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
                  <Typography variant="body2">
                    Pista:{' '}
                    <span style={{ textTransform: 'capitalize' }}>
                      {session.pista.toLowerCase()}
                    </span>
                  </Typography>
                  <Typography variant="body2">
                    Distância: {session.distancia.toFixed(2)} metros
                  </Typography>
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
                        </TableRow>
                        {Object.entries(session.velocidade).map(([timeKey, vel], idx) => (
                          <TableRow key={idx}>
                            <TableCell component="th" scope="row">
                              {timeKey}
                            </TableCell>
                            <TableCell align="right">{session.BPM[Number(timeKey)]}</TableCell>
                            <TableCell align="right">{vel}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
};
