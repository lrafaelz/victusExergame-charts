import React from 'react';
import { Typography, Paper, ButtonBase } from '@mui/material';

interface PatientButtonProps {
  name: string;
  age: number;
  description?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

const PatientButton: React.FC<PatientButtonProps> = ({
  name,
  age,
  description = 'Description',
  isSelected = false,
  onClick,
}) => {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: '100%',
        height: '100%',
        textAlign: 'left',
        borderRadius: 2,
        border: isSelected ? '2px solid' : '1px solid',
        borderColor: isSelected ? 'secondary.main' : 'divider',
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 3,
          width: '100%',
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          {name}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {age} anos
        </Typography>
        <Typography variant="body1" color="text.disabled">
          {description}
        </Typography>
      </Paper>
    </ButtonBase>
  );
};

export default PatientButton;
