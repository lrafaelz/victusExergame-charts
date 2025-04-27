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
  ButtonGroup,
  IconButton,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CachedRoundedIcon from '@mui/icons-material/CachedRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import moment from 'moment';
import 'moment/locale/pt-br';
import { getPacientePista } from '../../firestore/pacientes';
import { PacienteSession } from '../../types/patientData';
import ReactApexChart from 'react-apexcharts';
import SessionComparison from '../SessionComparison/SessionComparison';

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
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  const [sessionData, setSessionData] = useState<Record<string, PacienteSession>>({});
  const [seriesArray, setSeriesArray] = useState<SeriesItem[]>([]);
  const [categories, setCategories] = useState<number[]>([]);
  const theme = useTheme();

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
      console.log('Sessions raw:', sessions);
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

  // Gera séries e categorias sempre que mudam as sessões selecionadas ou os dados
  useEffect(() => {
    // monta array de séries: para cada sessão, 3 séries (BPM, EMG, velocidade)
    const serieTemp: SeriesItem[] = [];
    selectedSessions.forEach((sessId, idx) => {
      const sess = sessionData[sessId];
      if (!sess) return;
      console.log('Dados da sessão:', sess);

      const bpmData = Object.values(sess.BPM || {});
      const emgData = Object.values(sess.EMG || {});
      const velData = Object.values(sess.velocidade || {});

      if (bpmData.length || emgData.length || velData.length) {
        serieTemp.push(
          { name: `BPM ${idx + 1}`, data: bpmData },
          { name: `EMG ${idx + 1}`, data: emgData },
          { name: `Velocidade ${idx + 1}`, data: velData },
        );
      }
    });

    console.log('Series geradas:', serieTemp);
    setSeriesArray(serieTemp);

    // categorias: 1 ponto a cada segundo (ou ajuste seu passo)
    const maxLen = serieTemp.reduce((max, s) => Math.max(max, s.data.length), 0);
    setCategories(Array.from({ length: maxLen }, (_, i) => i));
  }, [selectedSessions, sessionData]);

  const commonOptions = {
    chart: { toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' as const },
    xaxis: { categories, title: { text: 'Tempo (s)' } },
    legend: { position: 'top' as const },
  };

  const renderCharts = () => {
    console.log('Renderizando gráfico com series:', seriesArray);
    if (!seriesArray.length) return null;

    return (
      <Box sx={{ mt: 4, width: '100%' }}>
        <ReactApexChart
          options={{
            ...commonOptions,
            yaxis: [{ title: { text: 'BPM / EMG / Velocidade' } }],
          }}
          series={seriesArray}
          type="area"
          height={350}
        />
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

  // Função para recarregar os dados
  const handleReload = async () => {
    if (!patientId) return;
    const sessions = await getPacientePista(patientId);
    const ids = sessions.map(s => s.id);
    setAvailableSessions(ids);
    const dataMap: Record<string, PacienteSession> = {};
    sessions.forEach(s => {
      dataMap[s.id] = s as unknown as PacienteSession;
    });
    setSessionData(dataMap);
  };

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
        <Box display="flex" gap={2} justifyContent="center" alignItems="center">
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
        </Box>

        {/* botões auxiliares */}
        <ButtonGroup
          variant="contained"
          sx={{ bgcolor: 'primary.main', boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
        >
          <IconButton onClick={handleReload}>
            <CachedRoundedIcon sx={{ color: 'white' }} />
          </IconButton>
          <IconButton onClick={handleClear}>
            <ClearRoundedIcon sx={{ color: 'white' }} />
          </IconButton>
        </ButtonGroup>
      </Box>

      {/* gráfico e resumo */}
      {renderCharts()}

      {selectedSessions.length ? (
        <SessionComparison
          sessions={Object.values(selectedSessions.map(sessId => sessionData[sessId]))}
        />
      ) : null}
    </Box>
  );
};

export default SesssionFilter;
