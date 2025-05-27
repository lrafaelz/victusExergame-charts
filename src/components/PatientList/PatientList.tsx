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
import { PatientGrid } from './PatientGrid';
import { useState } from 'react';

interface PatientListProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  compact?: boolean;
}

export const PatientList: React.FC<PatientListProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  compact = false,
}) => {
  const { searchTerm, filteredPatients, handleSearchChange } = usePatientList(patients);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const actions = [
    { icon: <AddIcon />, name: 'Adicionar', action: () => console.log('Adicionar paciente') },
    { icon: <EditIcon />, name: 'Editar', action: () => console.log('Editar paciente') },
    { icon: <DeleteIcon />, name: 'Excluir', action: () => console.log('Excluir paciente') },
  ];

  const handleAction = (action: () => void) => {
    action();
    handleClose();
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
                  onClose={handleClose}
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
        onSelectPatient={onSelectPatient}
        compact={compact}
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
    </Box>
  );
};
