import { Box } from '@mui/material';
import { Patient } from '../../types/patientData';

import { usePatientList } from './PatientList.functions';
import { SearchField } from './SearchField';
import { PatientGrid } from './PatientGrid';

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

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {!compact && <SearchField searchTerm={searchTerm} onSearchChange={handleSearchChange} />}
      <PatientGrid
        patients={filteredPatients}
        selectedPatient={selectedPatient}
        onSelectPatient={onSelectPatient}
        compact={compact}
      />
    </Box>
  );
};
