import React from 'react';
import { Grid } from '@mui/material';
import { Patient } from '../../types/patientData';
import { PatientAvatar } from '../PatientAvatar/PatientAvatar';
import PatientButton from '../PatientButton/PatientButton';

interface PatientGridProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  compact?: boolean;
}

export const PatientGrid: React.FC<PatientGridProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  compact = false,
}) => {
  return (
    <Grid container spacing={2} justifyContent="flex-start">
      {!compact
        ? patients.map((patient, index) => (
            <Grid size={{ xs: 12, sm: 6 }} key={index}>
              <PatientButton
                name={patient.nome}
                age={patient.idade}
                description={patient.detalhes}
                isSelected={selectedPatient?.id === patient.id}
                onClick={() => onSelectPatient(patient)}
              />
            </Grid>
          ))
        : patients.map((patient, index) => (
            <Grid size={{ xs: 12 }} key={index}>
              <PatientAvatar
                patient={patient}
                selectedPatient={selectedPatient}
                onSelectPatient={onSelectPatient}
              />
            </Grid>
          ))}
    </Grid>
  );
};
