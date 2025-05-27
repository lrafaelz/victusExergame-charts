import React, { useState, useEffect, useMemo, useRef } from 'react';
import DownloadIcon from '@mui/icons-material/Download';
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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from 'moment';
import 'moment/locale/pt-br';
import { getPacientePista, getPaciente } from '../../firestore/pacientes';
import { PacienteSession } from '../../types/patientData';
import ReactApexChart from 'react-apexcharts';
import SessionComparison from '../SessionComparison/SessionComparison';
import useMediaQuery from '@mui/material/useMediaQuery';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'svg2pdf.js';
import { logo } from '../../assets';

interface SeriesItem {
  name: string;
  data: number[];
  color?: string;
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
  // Estado para controlar o diálogo de informação (mobile)
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

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
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [pdfChartReady, setPdfChartReady] = useState(false);
  const [pdfComparisonReady, setPdfComparisonReady] = useState(false);
  const pdfChartRef = useRef<HTMLDivElement | null>(null);
  const pdfComparisonRef = useRef<HTMLDivElement | null>(null);

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

  // Cores definidas para cada tipo de dados - consistentes entre sessões
  const dataColors = useMemo(() => {
    return {
      BPM: ['#f6964f', '#ff8f59', '#ffad85', '#ffbd95'], // Tons de laranja
      EMG: ['#4fbbf6', '#59a2ff', '#85c0ff', '#95d3ff'], // Tons de azul
      velocidade: ['#5ef64f', '#82ff59', '#a2ff85', '#c2ff95'], // Tons de verde
    };
  }, []);

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
      colors: [...dataColors.BPM, ...dataColors.EMG, ...dataColors.velocidade], // Aplicar as cores consistentes
      tooltip: {
        theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
        y: {
          formatter: (value: number) => value.toFixed(2),
        },
      },
    }),
    [commonOptions, dataColors, theme.palette.mode],
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
          {
            name: `BPM ${idx + 1}`,
            data: bpmData,
            color: dataColors.BPM[idx % dataColors.BPM.length], // Cor consistente baseada no índice
          },
          {
            name: `EMG ${idx + 1}`,
            data: emgData,
            color: dataColors.EMG[idx % dataColors.EMG.length], // Cor consistente baseada no índice
          },
          {
            name: `Velocidade ${idx + 1}`,
            data: velData,
            color: dataColors.velocidade[idx % dataColors.velocidade.length], // Cor consistente baseada no índice
          },
        );
      }
    });

    setSeriesArray(serieTemp);

    const maxLen = serieTemp.reduce((max, s) => Math.max(max, s.data.length), 0);
    const step = isXs ? 15 : isSm ? 10 : 5;
    setCategories(Array.from({ length: maxLen }, (_, i) => i * step));
  }, [selectedSessions, sessionData, isXs, isSm, dataColors]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(orientation: landscape)');

    const handleOrientationChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches && (isXs || isSm) && seriesArray.length > 0) {
        setFullScreenOpen(true);
      } else if (!e.matches && fullScreenOpen) {
        setFullScreenOpen(false);
      }
    };

    handleOrientationChange(mediaQuery);

    mediaQuery.addEventListener('change', handleOrientationChange);

    window.addEventListener('resize', () => handleOrientationChange(mediaQuery));

    return () => {
      mediaQuery.removeEventListener('change', handleOrientationChange);
      window.removeEventListener('resize', () => handleOrientationChange(mediaQuery));
    };
  }, [seriesArray.length, fullScreenOpen, isXs, isSm]);

  useEffect(() => {
    if (isLandscape && (isXs || isSm) && seriesArray.length > 0 && !fullScreenOpen) {
      setFullScreenOpen(true);
    }
  }, [isLandscape, seriesArray.length, fullScreenOpen, isXs, isSm]);

  const renderCharts = () => {
    if (!seriesArray.length) return null;
    return (
      <Box sx={{ mt: 4, width: '100%' }} ref={chartRef}>
        {(isXs || isSm) && (
          <Typography variant="body2" color="textDisabled" sx={{ mb: 1, textAlign: 'center' }}>
            Para visualizar o gráfico em tela cheia, basta deitar o dispositivo (modo paisagem).
          </Typography>
        )}
        <ReactApexChart options={chartOptions} series={seriesArray} type="area" height={350} />
        <Modal
          open={fullScreenOpen}
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
              flex: 1,
              width: '100%',
              height: '100%',
              bgcolor: 'background.paper',
              minHeight: 0,
              minWidth: 0,
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
            <ReactApexChart
              options={chartOptions}
              series={seriesArray}
              type="area"
              height="100%"
              width="100%"
            />
          </Box>
        </Modal>
      </Box>
    );
  };

  const formatSessionLabel = (sessionId: string): string => {
    const date = extractDateFromSessionId(sessionId);
    if (date) {
      return `Sessão ${date.format('DD/MM/YYYY HH:mm')}`;
    }
    return `Sessão ${sessionId}`;
  };

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

    if (newType === 'sessions') {
      setSelectedSessions([]);
    } else {
      const endDefault = moment();
      const startDefault = moment().subtract(30, 'days');
      setStartDate(startDefault);
      setEndDate(endDefault);
    }
  };

  const handleClear = () => {
    setSelectedSessions([]);
    setSeriesArray([]);
    if (comparisonType === 'date') {
      setStartDate(null);
      setEndDate(null);
    }
  };

  const handleDownloadCompletePDF = async () => {
    if (seriesArray.length === 0) return;
    setPdfChartReady(true);
    setPdfComparisonReady(true);
    await new Promise(resolve => setTimeout(resolve, 200)); // Aguarda renderização dos componentes virtuais

    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Get patient information
      const patientInfo = await getPaciente(patientId || '');
      const patientName = patientInfo?.nome || 'Paciente';
      const patientAge = patientInfo?.idade || 'N/A';
      const patientDetails = patientInfo?.detalhes || 'Sem detalhes adicionais';

      // Title and patient info
      pdf.setFontSize(20);
      pdf.setTextColor(246, 150, 79);
      pdf.text('Relatório Victus Exergame', 15, 15);

      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Paciente: ${patientName}`, 15, 25);
      pdf.text(`Idade: ${patientAge} anos`, 15, 30);
      pdf.text(`Detalhes: ${patientDetails}`, 15, 35);

      // Logo à direita
      const logoWidth = 60;
      const img = new window.Image();
      img.src = logo;
      await new Promise(resolve => {
        img.onload = resolve;
      });
      const aspect = img.width / img.height;
      const logoHeight = logoWidth / aspect;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const logoX = pageWidth - logoWidth - 15;
      const logoY = 15;
      pdf.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);

      // Informações das sessões
      let infoY = 50;
      pdf.setFontSize(14);
      pdf.setTextColor(246, 150, 79);
      pdf.text('Informações das Sessões', 15, infoY);

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      infoY += 5;

      if (comparisonType === 'date') {
        pdf.text(
          `Período: ${startDate?.format('DD/MM/YYYY')} até ${endDate?.format('DD/MM/YYYY')}`,
          15,
          infoY,
        );
        infoY += 5;
        pdf.text(`Total de sessões no período: ${selectedSessions.length}`, 15, infoY);
      } else {
        pdf.text('Sessões selecionadas:', 15, infoY);
        infoY += 5;
        selectedSessions.forEach((sessId, index) => {
          const sessionLabel = formatSessionLabel(sessId);
          pdf.text(`${index + 1}. ${sessionLabel}`, 15, infoY);
          infoY += 5;
        });
      }

      pdf.addPage();
      if (pdfComparisonRef.current) {
        const comparisonCanvas = await html2canvas(pdfComparisonRef.current, {
          backgroundColor: '#fff',
          scale: 2,
        });
        const comparisonImg = comparisonCanvas.toDataURL('image/png');
        pdf.addImage(comparisonImg, 'PNG', 15, 10, 270, 120); // mm
      } else {
        pdf.setFontSize(12);
        pdf.setTextColor(200, 0, 0);
        pdf.text('Erro ao exportar comparativo.', 15, 30);
      }
      infoY += 5;
      pdf.setFontSize(14);
      pdf.setTextColor(246, 150, 79);
      pdf.text('Gráfico das Sessões', 15, infoY);
      infoY += 5;
      if (pdfChartRef.current) {
        const chartCanvas = await html2canvas(pdfChartRef.current, {
          backgroundColor: '#fff',
          scale: 2,
        });
        const chartImg = chartCanvas.toDataURL('image/png');
        pdf.addImage(chartImg, 'PNG', 15, infoY, 270, 120); // mm
        infoY += 120 + 5;
      } else {
        pdf.setFontSize(12);
        pdf.setTextColor(200, 0, 0);
        pdf.text('Erro ao exportar gráfico.', 15, infoY + 10);
        infoY += 15;
      }
      for (let i = 0; i < selectedSessions.length; i++) {
        const session = sessionData[selectedSessions[i]];
        if (!session) continue;

        if (i >= 0) {
          pdf.addPage();
        }

        pdf.setFontSize(14);
        pdf.setTextColor(246, 150, 79); // Orange color
        pdf.text(`Detalhes da Sessão ${i + 1}: ${formatSessionLabel(selectedSessions[i])}`, 15, 15);

        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0); // Black color

        const intervals = Object.keys(session.velocidade || {}).length;
        const duration = intervals * 5;
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        const durationFormatted = `${minutes}m ${seconds}s`;

        pdf.text(`Distância: ${session.distancia} metros`, 15, 25);
        pdf.text(`Pontuação: ${session.pontuacao}`, 15, 30);
        pdf.text(`Duração: ${durationFormatted}`, 15, 35);

        // Create table headers
        pdf.setFontSize(10);
        pdf.text('Tempo (s)', 15, 45);
        pdf.text('BPM', 60, 45);
        pdf.text('EMG', 100, 45);
        pdf.text('Velocidade', 140, 45);

        let tableY = 50;
        const rowHeight = 7;

        // Add table data
        Object.entries(session.velocidade || {}).forEach(([timeKey, velocity]) => {
          if (tableY > 180) {
            pdf.addPage();
            tableY = 20;
            pdf.text('Tempo (s)', 15, tableY);
            pdf.text('BPM', 60, tableY);
            pdf.text('EMG', 100, tableY);
            pdf.text('Velocidade', 140, tableY);
            tableY += rowHeight;
          }

          pdf.text(timeKey, 15, tableY);
          pdf.text(String(session.BPM?.[Number(timeKey)] || ''), 60, tableY);
          pdf.text(String(session.EMG?.[Number(timeKey)] || ''), 100, tableY);
          pdf.text(String(velocity || ''), 140, tableY);

          tableY += rowHeight;
        });
      }

      // Add footer with generation date
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128); // Gray color
        pdf.text(
          `Gerado em ${new Date().toLocaleString('pt-BR')}`,
          pdf.internal.pageSize.width - 60,
          pdf.internal.pageSize.height - 10,
        );
      }

      pdf.save(`victus-relatorio-${patientName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF completo:', error);
      alert('Ocorreu um erro ao gerar o PDF completo. Por favor, tente novamente.');
    } finally {
      setPdfChartReady(false);
      setPdfComparisonReady(false);
    }
  };

  return (
    <Box
      sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
    >
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

        <Box display="flex" justifyContent="center" alignItems="center">
          {comparisonType === 'sessions' ? (
            <>
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

              {isXs || isSm ? (
                <IconButton
                  onClick={() => setInfoDialogOpen(true)}
                  sx={{ ml: 0.5 }}
                  color="primary"
                  size="small"
                >
                  <InfoOutlinedIcon />
                </IconButton>
              ) : (
                <Tooltip
                  title="A ordem das sessões selecionadas define a numeração nos gráficos (ex: EMG 1, EMG 2, etc)"
                  arrow
                >
                  <IconButton sx={{ ml: 0.5 }} color="primary" size="small">
                    <InfoOutlinedIcon />
                  </IconButton>
                </Tooltip>
              )}
            </>
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
          <IconButton onClick={handleClear}>
            <ClearRoundedIcon sx={{ color: 'white', bgcolor: 'primary.main', borderRadius: 1 }} />
          </IconButton>
        </Box>
        {selectedSessions.length > 0 && (
          <Typography variant="caption" sx={{ mt: 1 }}>
            {selectedSessions.length}{' '}
            {selectedSessions.length === 1 ? 'sessão selecionada' : 'sessões selecionadas'}
          </Typography>
        )}
      </Box>

      {renderCharts()}

      {seriesArray.length > 0 && (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDownloadCompletePDF}
            startIcon={<DownloadIcon />}
            sx={{
              bgcolor: 'orangeVictus',
              '&:hover': {
                bgcolor: theme =>
                  theme.palette.mode === 'light'
                    ? 'rgba(246, 150, 79, 0.8)'
                    : 'rgba(246, 150, 79, 0.6)',
              },
            }}
          >
            Baixar Relatório Completo (PDF)
          </Button>
        </Box>
      )}

      {selectedSessions.length ? (
        <SessionComparison
          sessions={selectedSessions.map(sessId => sessionData[sessId]).filter(Boolean)}
        />
      ) : null}

      <Dialog open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)}>
        <DialogTitle>Informação</DialogTitle>
        <DialogContent>
          <Typography>
            A ordem das sessões selecionadas define a numeração nos gráficos (ex: EMG 1, EMG 2,
            etc).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Gráfico virtual para PDF */}
      {pdfChartReady && (
        <div style={{ position: 'absolute', left: -9999, top: 0 }}>
          <div ref={pdfChartRef} style={{ width: 1122, height: 439, background: '#fff' }}>
            <ReactApexChart
              options={chartOptions}
              series={seriesArray}
              type="area"
              width={1122}
              height={439}
            />
          </div>
        </div>
      )}
      {/* Comparativo virtual para PDF */}
      {pdfComparisonReady && (
        <SessionComparison
          sessions={selectedSessions.map(sessId => sessionData[sessId]).filter(Boolean)}
          pdfComparisonReady={pdfComparisonReady}
          pdfComparisonRef={pdfComparisonRef}
        />
      )}
    </Box>
  );
};

export default SesssionFilter;
