import {
  Box,
  Typography,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import { PatientList } from '../components/PatientList/PatientList';
import { useEffect, useState } from 'react';
import { CloseDrawerWidth, HeaderSize, OpenDrawerWidth } from '../utils/constants';
import { getAllPacientes } from '../firestore/pacientes';
import { Patient } from '../types/patientData';
import { PageHeader } from '../components/PageHeader/PageHeader';
import SesssionFilter from '../components/SesssionFilter/SesssionFilter';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export const Home = () => {
  const theme = useTheme();
  const { user, loading } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);

  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleToggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const onSelectPatient = (patient: Patient) => {
    if (selectedPatient && patient.id === selectedPatient.id) {
      setSelectedPatient(null);
    } else {
      setSelectedPatient(patient);
    }
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
  };

  const fetchPatients = async () => {
    try {
      const pacientesFromDB = await getAllPacientes();
      setPatients(pacientesFromDB);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    }
  };

  // Evita flash de redirecionamento: só redireciona se loading for false e user for null
  if (loading) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        height: '100%',
        width: '100%',
        pt: { xs: 0, md: HeaderSize },
        overflow: 'hidden', // Prevenir overflow do container principal
      }}
    >
      {/* Drawer sempre presente, mas pode ser temporário (mobile) ou permanente (desktop) */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={drawerOpen}
        onClose={handleToggleDrawer}
        sx={{
          display: { xs: 'block', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerOpen ? OpenDrawerWidth : CloseDrawerWidth,
            transition: 'width 0.3s',
            borderRight: '1px solid',
            borderColor: 'divider',
            position: 'relative', // Alterado para relative para prevenir conflitos de layout
          },
          width: isMobile ? 0 : drawerOpen ? OpenDrawerWidth : CloseDrawerWidth,
          flexShrink: 0,
          transition: 'width 0.3s',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: drawerOpen ? 'flex-end' : 'center',
            width: '100%',
            overflowX: 'hidden',
            transition: 'width 0.3s',
            pt: HeaderSize,
          }}
        >
          {patients.length > 0 && (
            <IconButton
              onClick={handleToggleDrawer}
              sx={{
                m: 1,
                width: 40,
                height: 40,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              {drawerOpen ? <ChevronLeftRoundedIcon /> : <MenuIcon />}
            </IconButton>
          )}
          <PatientList
            patients={patients}
            compact={!drawerOpen}
            selectedPatient={selectedPatient}
            onSelectPatient={onSelectPatient}
          />
        </Box>
      </Drawer>

      {/* Conteúdo principal, adaptando layout conforme o tamanho da tela */}
      <Box
        component="main"
        sx={{
          flex: 1,
          px: isMobile ? 1 : 5,
          py: 2,
          width: '100%',
          height: '100%',
          overflow: 'auto', // Permitir rolagem apenas no conteúdo principal
          transition: 'margin-left 0.3s',
        }}
      >
        {selectedPatient ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <PageHeader
              title={selectedPatient.nome}
              idade={selectedPatient.idade || 0}
              detalhes={selectedPatient.detalhes || ''}
              onBack={isMobile ? handleBackToList : undefined}
            />
            <SesssionFilter patientId={selectedPatient.id} />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            {!isMobile && (
              <Typography variant="h6" color="textDisabled" sx={{ mb: 3, textAlign: 'center' }}>
                Selecione um paciente para obter detalhes das sessões
              </Typography>
            )}
            {/* Lista de pacientes para mobile, ou para desktop se nenhum paciente selecionado */}
            {isMobile && (
              <PatientList
                patients={patients}
                compact={false}
                selectedPatient={selectedPatient}
                onSelectPatient={onSelectPatient}
              />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
