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
import { getPacientePista } from '../../firestore/pacientes';
import { PacienteSession } from '../../types/patientData';
import ReactApexChart from 'react-apexcharts';
import SessionComparison from '../SessionComparison/SessionComparison';
import useMediaQuery from '@mui/material/useMediaQuery';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  // Contador de renderizações
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const [renderStats, setRenderStats] = useState({ count: 0, timeSinceLastRender: 0 });

  // Estado para controlar o diálogo de informação (mobile)
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

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
  const chartRef = useRef<HTMLDivElement | null>(null);

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

    // categorias: intervalo dinâmico conforme a tela
    const maxLen = serieTemp.reduce((max, s) => Math.max(max, s.data.length), 0);
    const step = isXs ? 15 : isSm ? 10 : 5;
    setCategories(Array.from({ length: maxLen }, (_, i) => i * step));
  }, [selectedSessions, sessionData, isXs, isSm, dataColors]);

  // Efeito para detectar mudanças na orientação do dispositivo
  useEffect(() => {
    // Usando matchMedia que é o método moderno para detectar orientação
    const mediaQuery = window.matchMedia('(orientation: landscape)');

    const handleOrientationChange = (e: MediaQueryListEvent | MediaQueryList) => {
      console.log('🔍 Detector de orientação disparado:', {
        matches: e.matches, // true = landscape, false = portrait
        seriesCount: seriesArray.length,
        isMediaQueryEvent: e instanceof MediaQueryListEvent,
      });

      // Se estiver em landscape e houver dados para mostrar, abra o modal
      if (e.matches && seriesArray.length > 0) {
        console.log('✅ Abrindo modal em orientação landscape com dados disponíveis');
        setFullScreenOpen(true);
      }
      // Se estiver em portrait, feche o modal
      else if (!e.matches && fullScreenOpen) {
        console.log('📱 Fechando modal pois saiu do modo paisagem');
        setFullScreenOpen(false);
      }
    };

    // Importante: Verificar o estado inicial ao montar o componente
    // Isso garante que o modal abra se o dispositivo já estiver em landscape
    handleOrientationChange(mediaQuery);
    console.log('📱 Estado inicial de orientação:', {
      isLandscape: mediaQuery.matches,
      windowOrientation: window.orientation !== undefined ? window.orientation : 'não disponível',
      seriesCount: seriesArray.length,
      fullScreenOpen,
    });

    // Adicionar o listener para detecção de mudança de orientação
    mediaQuery.addEventListener('change', handleOrientationChange);

    // Método alternativo para dispositivos iOS mais antigos que podem não suportar matchMedia adequadamente
    window.addEventListener('resize', () => handleOrientationChange(mediaQuery));

    // Limpar os listeners quando o componente for desmontado
    return () => {
      mediaQuery.removeEventListener('change', handleOrientationChange);
      window.removeEventListener('resize', () => handleOrientationChange(mediaQuery));
    };
  }, [seriesArray.length, fullScreenOpen]);

  // Efeito para forçar a abertura do modal quando houver dados disponíveis e o dispositivo estiver em landscape
  useEffect(() => {
    if (isLandscape && seriesArray.length > 0 && !fullScreenOpen) {
      console.log('🌍 Forçando abertura do modal - Dispositivo em landscape com dados disponíveis');
      setFullScreenOpen(true);
    }
  }, [isLandscape, seriesArray.length, fullScreenOpen]);

  const renderCharts = () => {
    if (!seriesArray.length) return null;
    return (
      <Box sx={{ mt: 4, width: '100%', position: 'relative' }} ref={chartRef}>
        {/* Mostrar mensagem apenas em dispositivos móveis */}
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

  // Função para baixar relatório completo (gráfico + comparativo + parciais) em PDF
  const handleDownloadCompletePDF = async () => {
    if (!chartRef.current || seriesArray.length === 0) return;

    try {
      // Cria um PDF em formato A4 landscape
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Adiciona título principal
      const title = `Relatório Completo VICTUS - ${new Date().toLocaleDateString('pt-BR')}`;
      pdf.setFontSize(18);
      pdf.text(title, 15, 15);

      // 1. CAPTURA E ADICIONA O GRÁFICO
      const graphCanvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: theme.palette.background.paper,
      });
      // Adiciona subtítulo para o gráfico
      pdf.setFontSize(14);
      pdf.text('Gráfico de Sessões', 15, 25);

      // Adiciona informações das sessões
      pdf.setFontSize(10);
      let yPosition = 30;

      // Lista as sessões incluídas no gráfico
      pdf.text('Sessões analisadas:', 15, yPosition);
      yPosition += 5;

      selectedSessions.forEach((sessId, index) => {
        const sessionLabel = formatSessionLabel(sessId);
        pdf.text(`${index + 1}. ${sessionLabel}`, 15, yPosition);
        yPosition += 5;
      });

      // Adiciona o gráfico convertido para imagem
      const graphImgData = graphCanvas.toDataURL('image/png');
      const graphWidth = 270; // largura do documento A4 em landscape (297mm) menos as margens
      const graphHeight = (graphCanvas.height * graphWidth) / graphCanvas.width;

      // Posiciona a imagem do gráfico
      pdf.addImage(graphImgData, 'PNG', 15, yPosition + 5, graphWidth, graphHeight);

      // Adiciona uma nova página para o comparativo e parciais
      pdf.addPage();

      // 2. CAPTURA E ADICIONA O COMPARATIVO DE SESSÕES
      const comparisonElement = document.querySelector('.session-comparison-container');
      if (comparisonElement) {
        const comparisonCanvas = await html2canvas(comparisonElement as HTMLElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          onclone: (_, element) => {
            // Expande todos os accordions no clone para capturar as tabelas de parciais
            const accordions = element.querySelectorAll('.MuiAccordion-root');
            accordions.forEach((accordion: Element) => {
              accordion.classList.add('Mui-expanded');
              const details = accordion.querySelector('.MuiAccordionDetails-root');
              if (details) {
                (details as HTMLElement).style.display = 'block';
              }
            });
          },
        });
        // Adiciona subtítulo para o comparativo
        pdf.setFontSize(14);
        pdf.text('Comparativo de Sessões', 15, 15);
        pdf.text('Comparativo de Sessões', 15, 15);

        // Adiciona o comparativo convertido para imagem
        const comparisonImgData = comparisonCanvas.toDataURL('image/png');
        const comparisonWidth = 270;
        const comparisonHeight =
          (comparisonCanvas.height * comparisonWidth) / comparisonCanvas.width;

        // Se a altura do comparativo for muito grande, reduzimos para caber na página
        const maxHeight = 180; // altura máxima disponível na página A4 landscape
        let finalHeight = comparisonHeight;
        let finalY = 25;

        if (comparisonHeight > maxHeight) {
          finalHeight = maxHeight;
          finalY = 20;
        }

        // Posiciona a imagem do comparativo
        pdf.addImage(comparisonImgData, 'PNG', 15, finalY, comparisonWidth, finalHeight);

        // Se o comparativo for muito grande, adiciona mais páginas para as parciais
        if (comparisonHeight > maxHeight) {
          pdf.addPage();
        }
      }

      // 3. ADICIONA AS PARCIAIS DETALHADAS
      for (let i = 0; i < selectedSessions.length; i++) {
        const session = sessionData[selectedSessions[i]];
        if (!session) continue;

        // Se não for a primeira sessão, adicione uma nova página
        if (i > 0) {
          pdf.addPage();
        }

        // Título da sessão
        pdf.setFontSize(14);
        pdf.text(`Parciais da Sessão ${i + 1}: ${formatSessionLabel(selectedSessions[i])}`, 15, 15);

        // Informações da sessão
        pdf.setFontSize(10);

        const intervals = Object.keys(session.velocidade || {}).length;
        const duration = intervals * 5;
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        const durationFormatted = `${minutes}m ${seconds}s`;

        pdf.text(`Distância: ${session.distancia} metros`, 15, 25);
        pdf.text(`Pontuação: ${session.pontuacao}`, 15, 30);
        pdf.text(`Duração: ${durationFormatted}`, 15, 35);
        // Cabeçalho da tabela
        pdf.setFontSize(10);
        pdf.text('Tempo (s)', 15, 45);
        pdf.text('BPM', 60, 45);
        pdf.text('EMG', 100, 45);
        pdf.text('Velocidade', 140, 45);
        pdf.text('Velocidade', 140, 45);

        let tableY = 50;
        const rowHeight = 7;

        // Adiciona os dados na tabela
        Object.entries(session.velocidade || {}).forEach(([timeKey, velocity]) => {
          // Se chegou ao fim da página, adiciona uma nova
          if (tableY > 180) {
            pdf.addPage();
            tableY = 20;
            pdf.text('Tempo (s)', 15, tableY);
            pdf.text('BPM', 60, tableY);
            pdf.text('EMG', 100, tableY);
            pdf.text('Velocidade', 140, tableY);
            tableY += rowHeight;
          }
          // Adiciona linha na tabela
          pdf.text(timeKey, 15, tableY);
          pdf.text(String(session.BPM?.[Number(timeKey)] || ''), 60, tableY);
          pdf.text(String(session.EMG?.[Number(timeKey)] || ''), 100, tableY);
          pdf.text(String(velocity || ''), 140, tableY);
          pdf.text(String(velocity || ''), 140, tableY);

          tableY += rowHeight;
        });
      }

      // Salva o PDF completo
      pdf.save('victus-relatorio-completo.pdf');
    } catch (error) {
      console.error('Erro ao gerar PDF completo:', error);
      alert('Ocorreu um erro ao gerar o PDF completo. Por favor, tente novamente.');
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

              {/* Botão de informação com tooltip para desktop e diálogo para mobile */}
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
          {/* Botão de limpar gráfico colado ao select */}
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

      {/* Botão para baixar relatório completo */}
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

      {/* Diálogo de informação para dispositivos móveis */}
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
    </Box>
  );
};

export default SesssionFilter;
