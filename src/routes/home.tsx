import { Box, Typography, Drawer, IconButton, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import { PatientList } from '../components/PatientList/PatientList';
import { useEffect, useState } from 'react';
import { CloseDrawerWidth, HeaderSize, OpenDrawerWidth } from '../utils/constants';
import { getAllPacientes } from '../firestore/pacientes';
import { Patient } from '../types/patientData';
import { PageHeader } from '../components/PageHeader/PageHeader';

export const Home = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const theme = useTheme();

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
      sx={{
        pt: { xs: 0, md: HeaderSize },
        height: '100%',
      }}
    >
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        open={drawerOpen}
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerOpen ? OpenDrawerWidth : CloseDrawerWidth,
            transition: 'width 0.3s',
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
            <IconButton onClick={handleToggleDrawer} sx={{ m: 1, width: 40, height: 40 }}>
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

      {/* Mobile View */}
      {useMediaQuery(theme.breakpoints.down('sm')) ? (
        <Box sx={{ height: '100%', py: 2 }}>
          {selectedPatient ? (
            <>
              <PageHeader
                title={selectedPatient.nome}
                description={
                  <>
                    <Typography variant="body2" color="textDisabled" fontWeight="Medium">
                      {selectedPatient.idade} anos
                    </Typography>
                    <Typography variant="body2" color="textDisabled">
                      {selectedPatient.detalhes}
                    </Typography>
                  </>
                }
                onBack={handleBackToList}
              />
            </>
          ) : (
            <PatientList
              patients={patients}
              compact={false}
              selectedPatient={selectedPatient}
              onSelectPatient={onSelectPatient}
            />
          )}
        </Box>
      ) : (
        // Desktop Content
        <Box
          sx={{
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: {
              xs: '100%',
              sm: drawerOpen
                ? `calc(100% - ${OpenDrawerWidth})`
                : `calc(100% - ${CloseDrawerWidth})`,
            },
            height: '100%',
            marginLeft: {
              xs: 0,
              sm: drawerOpen ? OpenDrawerWidth : CloseDrawerWidth,
            },
            transition: 'all 0.3s',
            position: 'relative',
          }}
        >
          <Typography variant="h6" color="textDisabled" sx={{ mb: 3, textAlign: 'center' }}>
            {selectedPatient
              ? `Paciente selecionado: ${selectedPatient.nome}`
              : 'Selecione um paciente para obter detalhes das sessões'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
