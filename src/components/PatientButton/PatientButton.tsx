import React from 'react';
import { Typography, Paper, ButtonBase } from '@mui/material';

interface PatientButtonProps {
  name: string | undefined;
  age: number | undefined;
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
      component={Paper}
      elevation={1}
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: '100%',
        height: '100%',
        p: 3,
        borderRadius: 2,
        border: isSelected ? '2px solid' : '1px solid',
        borderColor: isSelected ? 'secondary.main' : 'divider',
      }}
    >
      <Typography
        variant="h6"
        fontWeight="bold"
        sx={{
          width: '100%',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        }}
      >
        {name && name.length > 24 ? `${name.slice(0, 30)}...` : name}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ width: '100%' }}>
        {age} anos
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ width: '100%' }}>
        {description}
      </Typography>
    </ButtonBase>
  );
};

export default PatientButton;
