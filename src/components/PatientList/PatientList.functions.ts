import { useState, useMemo } from 'react';
import { Patient } from '../../types/patientData';

export const usePatientList = (patients: Patient[]) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = useMemo(() => {
    return patients.filter(patient =>
      patient.nome.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [patients, searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return {
    searchTerm,
    filteredPatients,
    handleSearchChange,
  };
};
