import React from 'react';
import { Typography, Paper, ButtonBase, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface PatientButtonProps {
  name: string | undefined;
  age: number | undefined;
  description?: string;
  isSelected?: boolean;
  onClick?: () => void;
  selectionMode?: 'edit' | 'delete' | null;
}

const PatientButton: React.FC<PatientButtonProps> = ({
  name,
  age,
  description = 'Description',
  isSelected = false,
  onClick,
  selectionMode = null,
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
        position: 'relative',
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

      {selectionMode && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
          }}
        >
          {selectionMode === 'edit' && <EditIcon sx={{ color: 'white', fontSize: 40 }} />}
          {selectionMode === 'delete' && <DeleteIcon sx={{ color: 'white', fontSize: 40 }} />}
        </Box>
      )}
    </ButtonBase>
  );
};

export default PatientButton;
