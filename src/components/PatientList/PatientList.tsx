import {
  Box,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Button,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Patient } from '../../types/patientData';

import { usePatientList } from './PatientList.functions';
import { SearchField } from './SearchField';

import { useState } from 'react';
import { PatientForm, PatientFormData } from '../PatientForm';
import { createPaciente, updatePaciente, deletePaciente } from '../../firestore/pacientes';
import { PatientGrid } from './PatientGrid.tsx';

interface PatientListProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient | null) => void;
  compact?: boolean;
  onPatientsUpdate?: () => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  compact = false,
  onPatientsUpdate,
}) => {
  const { searchTerm, filteredPatients, handleSearchChange } = usePatientList(patients);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // State for PatientForm modal
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  // State for potential patient data to edit (null for new patient)
  const [editingPatient, setEditingPatient] = useState<PatientFormData | null>(null);
  // State for selection mode ('edit', 'delete', or null)
  const [selectionMode, setSelectionMode] = useState<'edit' | 'delete' | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenPatientForm = (patient?: Patient) => {
    if (patient) {
      setEditingPatient({
        id: patient.id,
        name: patient.nome,
        age: patient.idade?.toString() || '',
        description: patient.detalhes || '',
      });
    } else {
      setEditingPatient(null);
    }
    setIsPatientFormOpen(true);
    handleCloseMenu(); // Close menu if open
    setSelectionMode(null); // Exit selection mode when form opens
  };

  const handleClosePatientForm = () => {
    setIsPatientFormOpen(false);
    setEditingPatient(null); // Clear editing patient data
  };

  const handleSubmitPatientForm = async (data: PatientFormData) => {
    if (editingPatient && editingPatient.id) {
      // Update existing patient
      await updatePaciente(editingPatient.id, {
        nome: data.name,
        idade: parseInt(data.age),
        detalhes: data.description,
      });
      console.log('Patient updated:', editingPatient.id, data);
      onPatientsUpdate?.();
      if (editingPatient?.id === selectedPatient?.id) {
        onSelectPatient(null);
      }
    } else {
      // Create new patient
      await createPaciente(data.name, parseInt(data.age), data.description);
      console.log('Patient created:', data);
      onPatientsUpdate?.();
    }
    handleClosePatientForm();
  };

  const actions = [
    { icon: <AddIcon />, name: 'Adicionar', action: () => handleOpenPatientForm() },
    {
      icon: <EditIcon />,
      name: 'Editar',
      action: () => {
        setSelectionMode('edit');
        handleCloseMenu();
      },
    },
    {
      icon: <DeleteIcon />,
      name: 'Excluir',
      action: () => {
        setSelectionMode('delete');
        handleCloseMenu();
      },
    },
  ];

  const handleAction = (actionFn: () => void) => {
    actionFn();
    handleCloseMenu();
  };

  const handlePatientGridSelect = async (patient: Patient) => {
    if (selectionMode === 'edit') {
      handleOpenPatientForm(patient);
    } else if (selectionMode === 'delete') {
      if (window.confirm(`Tem certeza que deseja excluir o paciente ${patient.nome}?`)) {
        if (patient.id) {
          await deletePaciente(patient.id);
          console.log('Patient deleted:', patient.id);
          onPatientsUpdate?.();
          if (patient.id === selectedPatient?.id) {
            onSelectPatient(null);
          }
        } else {
          console.error('Cannot delete patient without an ID');
        }
      }
      setSelectionMode(null); // Exit selection mode
    } else {
      onSelectPatient(patient);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 2, position: 'relative' }}>
      {!compact && (
        <>
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
            Pacientes
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <SearchField searchTerm={searchTerm} onSearchChange={handleSearchChange} />
            </Box>
            {!isMobile && (
              <>
                <Button
                  variant="contained"
                  onClick={handleClick}
                  sx={{
                    minWidth: 'auto',
                    borderRadius: 4,
                    width: 56,
                    height: 56,
                    p: 0,
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                >
                  <AddIcon />
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleCloseMenu}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  {actions.map(action => (
                    <MenuItem key={action.name} onClick={() => handleAction(action.action)}>
                      {action.icon} {action.name}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
          </Box>
        </>
      )}
      <PatientGrid
        patients={filteredPatients}
        selectedPatient={selectedPatient}
        onSelectPatient={handlePatientGridSelect}
        compact={compact}
        selectionMode={selectionMode}
      />
      {isMobile && (
        <SpeedDial
          ariaLabel="CRUD de pacientes"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          {actions.map(action => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.action}
            />
          ))}
        </SpeedDial>
      )}
      <PatientForm
        open={isPatientFormOpen}
        onClose={handleClosePatientForm}
        onSubmit={handleSubmitPatientForm}
        patientData={editingPatient}
      />
    </Box>
  );
};
