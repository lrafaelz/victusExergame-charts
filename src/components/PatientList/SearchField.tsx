import React from 'react';
import { TextField, InputAdornment, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchFieldProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchField: React.FC<SearchFieldProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <>
      <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
        Pacientes
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        label="Pesquisar paciente"
        value={searchTerm}
        onChange={onSearchChange}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderRadius: 4,
            },
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />
    </>
  );
};
