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
    <Tooltip title={patient.name}>
      <Avatar
        sx={{
          mx: 'auto',
          bgcolor: 'white',
          width: 48,
          height: 48,
          fontSize: 16,
          cursor: 'pointer',
          border: selectedPatient?.name === patient.name ? '2px solid' : '2px solid',
          borderColor: selectedPatient?.name === patient.name ? 'secondary.main' : 'divider',
        }}
        onClick={() => onSelectPatient(patient)}
      >
        <Typography>
          {patient.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()}
        </Typography>
      </Avatar>
    </Tooltip>
  );
};
