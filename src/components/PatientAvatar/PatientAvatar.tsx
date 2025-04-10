import { Avatar, Tooltip, Typography } from '@mui/material';
import { Patient } from '../../types/patientData';

interface PatientAvatarProps {
  patient: Patient;
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
}

export const PatientAvatar = ({
  patient,
  selectedPatient,
  onSelectPatient,
}: PatientAvatarProps) => {
  return (
    <Tooltip title={patient.nome}>
      <Avatar
        sx={{
          mx: 'auto',
          bgcolor: 'white',
          width: 48,
          height: 48,
          fontSize: 16,
          cursor: 'pointer',
          border: selectedPatient?.id === patient.id ? '2px solid' : '2px solid',
          borderColor: selectedPatient?.id === patient.id ? 'secondary.main' : 'divider',
        }}
        onClick={() => onSelectPatient(patient)}
      >
        <Typography>
          {(patient.nome || '')
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()}
        </Typography>
      </Avatar>
    </Tooltip>
  );
};
