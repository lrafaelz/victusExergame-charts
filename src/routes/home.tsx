import { Box, Typography, Drawer, IconButton, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import { PatientList } from '../components/PatientList/PatientList';
import { useEffect, useState } from 'react';
import { CloseDrawerWidth, HeaderSize, OpenDrawerWidth } from '../utils/constants';
import { getAllPacientes } from '../firestore/pacientes';
import { Patient } from '../types/patientData';
import { PageHeader } from '../components/PageHeader/PageHeader';
import SesssionFilter from '../components/SesssionFilter/SesssionFilter';

export const Home = () => {
  const theme = useTheme();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);

  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

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

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'row', height: '100%', pt: { xs: 0, md: HeaderSize } }}
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
          },
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
        sx={{
          flex: 1,
          px: isMobile ? 1 : 5,
          py: 2,
          width: '100%',
          height: '100%',
          marginLeft: isMobile ? 0 : drawerOpen ? OpenDrawerWidth : CloseDrawerWidth,
          transition: 'all 0.3s',
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
