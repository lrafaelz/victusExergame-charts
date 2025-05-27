import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';

interface PatientFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => void;
  patientData?: PatientFormData | null; // Optional: for editing existing patient
}

export interface PatientFormData {
  id?: string; // Optional: for editing
  name: string;
  description: string;
  age: string; // Using string for age input, can be converted to number
}

const PatientForm: React.FC<PatientFormProps> = ({ open, onClose, onSubmit, patientData }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm')); // Full screen on mobile

  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    description: '',
    age: '',
  });

  useEffect(() => {
    if (patientData) {
      setFormData(patientData);
    } else {
      // Reset form if no patient data (for new patient)
      setFormData({ name: '', description: '', age: '' });
    }
  }, [patientData, open]); // Reset form when patientData changes or modal opens

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Basic validation (can be expanded)
    if (!formData.name || !formData.age) {
      alert('Nome e Idade são obrigatórios.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm" // Consistent max width for desktop modal
      fullWidth // Ensures the dialog takes up the full width up to maxWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
        sx: fullScreen ? { height: '100vh', maxHeight: '100vh', borderRadius: 0 } : {}, // Ensure full height on mobile
      }}
    >
      <DialogTitle>{patientData ? 'Editar Paciente' : 'Novo Paciente'}</DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}
      >
        <TextField
          autoFocus
          margin="dense"
          id="name"
          name="name"
          label="Nome Completo"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <TextField
          margin="dense"
          id="description"
          name="description"
          label="Descrição (Opcional)"
          type="text"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={formData.description}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          id="age"
          name="age"
          label="Idade"
          type="number" // Using type number for age
          fullWidth
          variant="outlined"
          value={formData.age}
          onChange={handleChange}
          required
          InputProps={{
            inputProps: {
              min: 0, // Optional: prevent negative age
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button type="submit" variant="contained">
          {patientData ? 'Salvar Alterações' : 'Criar Paciente'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PatientForm;
