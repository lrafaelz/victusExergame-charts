import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Button,
  useTheme,
  SelectChangeEvent,
  IconButton,
  Modal,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from 'moment';
import 'moment/locale/pt-br';
import { getPacientePista } from '../../firestore/pacientes';
import { PacienteSession } from '../../types/patientData';
import ReactApexChart from 'react-apexcharts';
import SessionComparison from '../SessionComparison/SessionComparison';
import useMediaQuery from '@mui/material/useMediaQuery';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';

interface SeriesItem {
  name: string;
  data: number[];
}

interface SesssionFilterProps {
  patientId: string | undefined;
}

const SesssionFilter: React.FC<SesssionFilterProps> = ({ patientId }) => {
  const [comparisonType, setComparisonType] = useState<'sessions' | 'date'>('sessions');
  const [startDate, setStartDate] = useState<moment.Moment | null>(null);
  const [endDate, setEndDate] = useState<moment.Moment | null>(null);
  const [dateError, setDateError] = useState('');
  const [selectedSessions, setSelectedSessions] = useState<string[]>(() => {
    // Recupera as sessões salvas do localStorage
    const savedSessions = localStorage.getItem(`selectedSessions_${patientId}`);
    return savedSessions ? JSON.parse(savedSessions) : [];
  });
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  const [sessionData, setSessionData] = useState<Record<string, PacienteSession>>({});
  const [seriesArray, setSeriesArray] = useState<SeriesItem[]>([]);
  const [categories, setCategories] = useState<number[]>([]);
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isLandscape = useMediaQuery('(orientation: landscape)');

  // Limpa as sessões quando muda o paciente
  useEffect(() => {
    setSelectedSessions([]);
    setSeriesArray([]);
    setSessionData({});
    setAvailableSessions([]);
  }, [patientId]);

  // Busca sessões
  useEffect(() => {
    if (!patientId) return;
    getPacientePista(patientId).then(sessions => {
      const ids = sessions.map(s => s.id);
      setAvailableSessions(ids);
      const dataMap: Record<string, PacienteSession> = {};
      sessions.forEach(s => {
        // O dado já vem processado da API
        dataMap[s.id] = s as unknown as PacienteSession;
      });
      setSessionData(dataMap);
    });
  }, [patientId]);

  // Salva as sessões selecionadas no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem(`selectedSessions_${patientId}`, JSON.stringify(selectedSessions));
  }, [selectedSessions, patientId]);

  // Função para reduzir a quantidade de pontos do array
  function downsampleArray<T>(arr: T[], percent: number): T[] {
    if (percent >= 1) return arr;
    const newLength = Math.max(1, Math.floor(arr.length * percent));
    if (newLength >= arr.length) return arr;
    const step = arr.length / newLength;
    return Array.from({ length: newLength }, (_, i) => arr[Math.floor(i * step)]);
  }

  // Gera séries e categorias sempre que mudam as sessões selecionadas ou os dados
  useEffect(() => {
    // monta array de séries: para cada sessão, 3 séries (BPM, EMG, velocidade)
    const serieTemp: SeriesItem[] = [];
    selectedSessions.forEach((sessId, idx) => {
      const sess = sessionData[sessId];
      if (!sess) return;
      // Downsample se for xs
      const percent = isXs ? 0.3 : 1;
      const bpmData = downsampleArray(Object.values(sess.BPM || {}), percent);
      const emgData = downsampleArray(Object.values(sess.EMG || {}), percent);
      const velData = downsampleArray(Object.values(sess.velocidade || {}), percent);

      if (bpmData.length || emgData.length || velData.length) {
        serieTemp.push(
          { name: `BPM ${idx + 1}`, data: bpmData },
          { name: `EMG ${idx + 1}`, data: emgData },
          { name: `Velocidade ${idx + 1}`, data: velData },
        );
      }
    });

    setSeriesArray(serieTemp);

    // categorias: intervalo dinâmico conforme a tela
    const maxLen = serieTemp.reduce((max, s) => Math.max(max, s.data.length), 0);
    const step = isXs ? 15 : isSm ? 10 : 5;
    setCategories(Array.from({ length: maxLen }, (_, i) => i * step));
  }, [selectedSessions, sessionData, isXs]);

  // Efeito para controlar o modo tela cheia quando a orientação muda
  useEffect(() => {
    const handleOrientationChange = () => {
      // Se houver séries sendo exibidas, abre em tela cheia
      if (seriesArray.length > 0) {
        setFullScreenOpen(true);
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [seriesArray.length]);

  // Fecha o modal se sair do landscape
  useEffect(() => {
    if (!isLandscape && fullScreenOpen) {
      setFullScreenOpen(false);
    }
  }, [isLandscape, fullScreenOpen]);

  const commonOptions = {
    chart: { toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' as const },
    xaxis: { categories, title: { text: 'Tempo (s)' } },
    legend: { position: 'top' as const },
  };

  const renderCharts = () => {
    if (!seriesArray.length) return null;
    return (
      <Box sx={{ mt: 4, width: '100%', position: 'relative' }}>
        <Typography variant="body2" color="textDisabled" sx={{ mb: 1, textAlign: 'center' }}>
          Para visualizar o gráfico em tela cheia, basta deitar o dispositivo (modo paisagem).
        </Typography>
        <ReactApexChart
          options={{
            ...commonOptions,
            yaxis: [{ title: { text: 'BPM / EMG / Velocidade' } }],
          }}
          series={seriesArray}
          type="area"
          height={350}
        />
        <Modal
          open={fullScreenOpen}
          onClose={() => setFullScreenOpen(false)}
          sx={{
            '& .MuiModal-root': {
              backgroundColor: 'background.paper',
            },
          }}
        >
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              bgcolor: 'background.paper',
              zIndex: 1300,
              p: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, right: 0, p: 1, zIndex: 1301 }}>
              <IconButton
                onClick={() => setFullScreenOpen(false)}
                sx={{
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <CloseRoundedIcon />
              </IconButton>
            </Box>
            <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, height: '100%', width: '100%' }}>
              <ReactApexChart
                options={{
                  ...commonOptions,
                  yaxis: [{ title: { text: 'BPM / EMG / Velocidade' } }],
                }}
                series={seriesArray}
                type="area"
                height={'100%'}
                width={'100%'}
              />
            </Box>
          </Box>
        </Modal>
      </Box>
    );
  };

  // handlers de data e seleção (mantidos iguais ao seu original)
  const handleStartDateChange = (newVal: moment.Moment | null) => {
    if (newVal?.isAfter(moment())) {
      return setDateError('A data inicial não pode ser posterior ao dia atual');
    }
    if (endDate && newVal?.isAfter(endDate)) setEndDate(newVal);
    setStartDate(newVal);
    setDateError('');
  };
  const handleEndDateChange = (newVal: moment.Moment | null) => {
    if (newVal?.isAfter(moment())) {
      return setDateError('A data final não pode ser posterior ao dia atual');
    }
    if (startDate && newVal?.isBefore(startDate)) setStartDate(newVal);
    setEndDate(newVal);
    setDateError('');
  };
  const handleSessionChange = (e: SelectChangeEvent<string[]>) =>
    setSelectedSessions(e.target.value as string[]);
  const handleTypeViewChange = () =>
    setComparisonType(ct => (ct === 'sessions' ? 'date' : 'sessions'));

  // Função para limpar tudo
  const handleClear = () => {
    setSelectedSessions([]);
    setSeriesArray([]);
    if (comparisonType === 'date') {
      setStartDate(null);
      setEndDate(null);
    }
  };

  return (
    <Box
      sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
    >
      {/* filtro e seleção */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Button
          variant="contained"
          startIcon={<SwapHorizIcon />}
          onClick={handleTypeViewChange}
          sx={{
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: 'transparent',
              outline: `2px solid ${theme.palette.primary.main}`,
              color: 'primary.main',
              boxShadow: 'none',
            },
          }}
        >
          Alternar filtro
        </Button>

        {/* seleção de sessões vs datas */}
        <Box display="flex" justifyContent="center" alignItems="center">
          {comparisonType === 'sessions' ? (
            <FormControl size="small" sx={{ minWidth: 230 }}>
              <InputLabel id="session-selection-label">Sessões</InputLabel>
              <Select
                labelId="session-selection-label"
                multiple
                value={selectedSessions}
                onChange={handleSessionChange}
                input={<OutlinedInput label="Sessões" />}
                renderValue={sel => {
                  const arr = sel as string[];
                  const shown = arr.slice(0, 2);
                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
                      {shown.map(v => (
                        <Chip key={v} label={`Sessão ${v}`} size="small" />
                      ))}
                      {arr.length > 2 && (
                        <Chip
                          label={`+${arr.length - 2}`}
                          size="small"
                          sx={{ bgcolor: 'transparent' }}
                        />
                      )}
                    </Box>
                  );
                }}
              >
                {availableSessions.map(sess => (
                  <MenuItem key={sess} value={sess}>
                    <Checkbox checked={selectedSessions.includes(sess)} />
                    <ListItemText primary={`Sessão ${sess}`} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Box display="flex" flexDirection="column" gap={1} alignItems="center">
              <Box display="flex" gap={1} alignItems="center">
                <DatePicker
                  label="Data de início"
                  value={startDate}
                  onChange={handleStartDateChange}
                  maxDate={moment()}
                  slotProps={{
                    textField: { size: 'small', error: !!dateError, helperText: dateError },
                  }}
                />
                <Typography>até</Typography>
                <DatePicker
                  label="Data de fim"
                  value={endDate}
                  onChange={handleEndDateChange}
                  maxDate={moment()}
                  slotProps={{
                    textField: { size: 'small', error: !!dateError, helperText: dateError },
                  }}
                />
              </Box>
              {startDate && endDate && startDate.isAfter(endDate) && (
                <Typography color="error" variant="caption">
                  A data inicial não pode ser posterior à data final
                </Typography>
              )}
            </Box>
          )}
          {/* Botão de limpar gráfico colado ao select */}
          <IconButton onClick={handleClear}>
            <ClearRoundedIcon sx={{ color: 'white', bgcolor: 'primary.main', borderRadius: 1 }} />
          </IconButton>
        </Box>
      </Box>

      {/* gráfico e resumo */}
      {renderCharts()}

      {selectedSessions.length ? (
        <SessionComparison
          sessions={selectedSessions.map(sessId => sessionData[sessId]).filter(Boolean)}
        />
      ) : null}
    </Box>
  );
};

export default SesssionFilter;
