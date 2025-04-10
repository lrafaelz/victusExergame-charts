import { Box, Grid, Typography, TextField, InputAdornment } from '@mui/material';
import { Patient } from '../../types/patientData';
import { PatientAvatar } from '../PatientAvatar/PatientAvatar';
import PatientButton from '../PatientButton/PatientButton';
import { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';

interface PatientListProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  compact?: boolean;
}

export const PatientList = ({
  patients,
  selectedPatient,
  onSelectPatient,
  compact = false,
}: PatientListProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const removeAccents = (str: string) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };
  const filteredPatients = patients.filter(patient => {
    const normalizedName = removeAccents(patient.nome?.toLowerCase() ?? '');
    const normalizedSearch = removeAccents(searchTerm.toLowerCase());
    return normalizedName.includes(normalizedSearch);
  });

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {!compact && (
        <>
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
            Pacientes
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            label="Pesquisar paciente"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderRadius: 4,
                },
              },
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </>
      )}
      <Grid container spacing={2} justifyContent="flex-start">
        {!compact
          ? filteredPatients.map((patient, index) => (
              <Grid size={6}>
                <PatientButton
                  key={index}
                  name={patient.nome?.split(' ')[0]}
                  age={patient.idade}
                  description={patient.detalhes}
                  isSelected={selectedPatient?.id === patient.id}
                  onClick={() => onSelectPatient(patient)}
                />
              </Grid>
            ))
          : patients.map((patient, index) => (
              <Grid size={12}>
                <PatientAvatar
                  key={index}
                  patient={patient}
                  selectedPatient={selectedPatient}
                  onSelectPatient={onSelectPatient}
                />
              </Grid>
            ))}
      </Grid>
    </Box>
  );
};
