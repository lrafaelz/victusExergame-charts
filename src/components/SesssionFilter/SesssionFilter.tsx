import React, { useState, useEffect, useMemo, useRef } from 'react';
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

// Interface para armazenar informações da sessão junto com sua data
interface SessionWithDate {
  id: string;
  date: moment.Moment;
  session: PacienteSession;
}

const SesssionFilter: React.FC<SesssionFilterProps> = ({ patientId }) => {
  // Contador de renderizações
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const [renderStats, setRenderStats] = useState({ count: 0, timeSinceLastRender: 0 });

  // Atualiza o contador de renderizações sem causar ciclos
  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    // Atualiza os stats apenas a cada segundo para evitar loops
    const timeoutId = setTimeout(() => {
      setRenderStats({
        count: renderCount.current,
        timeSinceLastRender,
      });
    }, 1000);

    return () => clearTimeout(timeoutId);
  });

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
  const [sessionsWithDates, setSessionsWithDates] = useState<SessionWithDate[]>([]);
  const [seriesArray, setSeriesArray] = useState<SeriesItem[]>([]);
  const [categories, setCategories] = useState<number[]>([]);
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isLandscape = useMediaQuery('(orientation: landscape)');

  // Função para extrair a data do ID da sessão
  const extractDateFromSessionId = useMemo(() => {
    return (sessionId: string): moment.Moment | null => {
      // Padrão esperado: "Sessão MM-DD-YYYY h:mm:ss A" (formato americano)
      // Modificado para aceitar formato com dígitos únicos sem zeros à esquerda
      const datePattern = /(\d{1,2}-\d{1,2}-\d{4}\s+\d{1,2}:\d{1,2}:\d{1,2}\s*[AP]M)/i;
      const match = sessionId.match(datePattern);

      if (match && match[1]) {
        // Parse a data no formato americano MM-DD-YYYY h:mm:ss A
        return moment(match[1], 'M-D-YYYY h:mm:ss A');
      }
      return null;
    };
  }, []); // função memoizada que não depende de nenhuma prop ou state

  // Memoize common chart options to avoid recreating objects each render
  const commonOptions = useMemo(
    () => ({
      chart: {
        toolbar: { show: false },
        animations: { enabled: false },
        redrawOnParentResize: false,
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth' as const },
      xaxis: { categories, title: { text: 'Tempo (s)' } },
      legend: { position: 'top' as const },
    }),
    [categories],
  );

  const chartOptions = useMemo(
    () => ({
      ...commonOptions,
      yaxis: [{ title: { text: 'BPM / EMG / Velocidade' } }],
    }),
    [commonOptions],
  );

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

      // Processa as sessões para extrair as datas
      const withDates: SessionWithDate[] = [];
      const dataMap: Record<string, PacienteSession> = {};

      sessions.forEach(s => {
        dataMap[s.id] = s as unknown as PacienteSession;

        // Extrai a data do ID da sessão
        const sessionDate = extractDateFromSessionId(s.id);
        if (sessionDate) {
          withDates.push({
            id: s.id,
            date: sessionDate,
            session: s as unknown as PacienteSession,
          });
        }
      });

      // Ordena as sessões por data (mais recentes primeiro)
      withDates.sort((a, b) => b.date.valueOf() - a.date.valueOf());

      setSessionsWithDates(withDates);
      setSessionData(dataMap);
    });
  }, [patientId, extractDateFromSessionId]);

  // Efeito para filtrar sessões por data quando o tipo de filtro for 'date'
  useEffect(() => {
    if (comparisonType === 'date' && startDate && endDate) {
      // Filtra sessões que estão entre as datas selecionadas
      const filteredSessions = sessionsWithDates
        .filter(s => {
          return s.date.isSameOrAfter(startDate, 'day') && s.date.isSameOrBefore(endDate, 'day');
        })
        .map(s => s.id);

      setSelectedSessions(filteredSessions);
    }
  }, [comparisonType, startDate, endDate, sessionsWithDates]);

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
  }, [selectedSessions, sessionData, isXs, isSm]);

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

  const renderCharts = () => {
    if (!seriesArray.length) return null;
    return (
      <Box sx={{ mt: 4, width: '100%', position: 'relative' }}>
        {/* Mostrar mensagem apenas em dispositivos móveis */}
        {(isXs || isSm) && (
          <Typography variant="body2" color="textDisabled" sx={{ mb: 1, textAlign: 'center' }}>
            Para visualizar o gráfico em tela cheia, basta deitar o dispositivo (modo paisagem).
          </Typography>
        )}
        <ReactApexChart options={chartOptions} series={seriesArray} type="area" height={350} />
        <Modal
          open={fullScreenOpen}
          onClose={() => setFullScreenOpen(false)}
          sx={{
            '& .MuiModal-root': {
              backgroundColor: 'background.paper',
            },
            overflow: 'hidden', // Prevent overflow from the modal
            '& ::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE and Edge
          }}
        >
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              bgcolor: 'background.paper',
              zIndex: 1300,
              p: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              maxWidth: '100%',
              maxHeight: '100%',
              '& ::-webkit-scrollbar': {
                display: 'none',
              },
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE and Edge
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
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                minWidth: 0,
                height: '100%',
                width: '100%',
                overflow: 'hidden', // Prevent chart from causing overflow
              }}
            >
              <ReactApexChart
                options={chartOptions}
                series={seriesArray}
                type="area"
                height="100%"
                width="100%"
              />
            </Box>
          </Box>
        </Modal>
      </Box>
    );
  };

  // Formatação para exibir data na lista de sessões
  const formatSessionLabel = (sessionId: string): string => {
    const date = extractDateFromSessionId(sessionId);
    if (date) {
      return `Sessão ${date.format('DD/MM/YYYY HH:mm')}`;
    }
    return `Sessão ${sessionId}`;
  };

  // handlers de data e seleção
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

  const handleTypeViewChange = () => {
    const newType = comparisonType === 'sessions' ? 'date' : 'sessions';
    setComparisonType(newType);

    // Limpa seleções ao mudar o modo
    if (newType === 'sessions') {
      setSelectedSessions([]);
    } else {
      // Define datas padrão: últimos 30 dias
      const endDefault = moment();
      const startDefault = moment().subtract(30, 'days');
      setStartDate(startDefault);
      setEndDate(endDefault);
    }
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
      {/* Indicador de renderizações (visível apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <Box
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            bgcolor: renderStats.timeSinceLastRender < 200 ? 'error.main' : 'success.main',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '12px',
            opacity: 0.7,
            pointerEvents: 'none',
          }}
        >
          Renders: {renderStats.count}
          {renderStats.timeSinceLastRender < 200 && ' ⚠️'}
        </Box>
      )}

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
          {comparisonType === 'sessions' ? 'Filtrar por datas' : 'Selecionar sessões'}
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
                        <Chip key={v} label={formatSessionLabel(v)} size="small" />
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
                    <ListItemText primary={formatSessionLabel(sess)} />
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
              {selectedSessions.length > 0 && (
                <Typography variant="caption" sx={{ mt: 1 }}>
                  {selectedSessions.length}{' '}
                  {selectedSessions.length === 1 ? 'sessão selecionada' : 'sessões selecionadas'}
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
