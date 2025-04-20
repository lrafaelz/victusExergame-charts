import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Button,
  useTheme,
  SelectChangeEvent,
  ButtonGroup,
  IconButton,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CachedRoundedIcon from '@mui/icons-material/CachedRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import moment from 'moment';
import 'moment/locale/pt-br';

const SessionComparison: React.FC = () => {
  const [comparisonType, setComparisonType] = useState<string>('sessions');
  const [startDate, setStartDate] = useState<moment.Moment | null>(null);
  const [endDate, setEndDate] = useState<moment.Moment | null>(null);
  const [dateError, setDateError] = useState<string>('');
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const theme = useTheme();

  const availableSessions = ['Sessão 1', 'Sessão 2', 'Sessão 3', 'Sessão 4', 'Sessão 5'];

  const handleStartDateChange = (newValue: moment.Moment | null) => {
    const today = moment();
    if (newValue && newValue.isAfter(today)) {
      setDateError('A data inicial não pode ser posterior ao dia atual');
      return;
    }

    if (endDate && newValue && newValue.isAfter(endDate)) {
      setEndDate(newValue);
    }

    setStartDate(newValue);
    setDateError('');
  };

  const handleEndDateChange = (newValue: moment.Moment | null) => {
    const today = moment();
    if (newValue && newValue.isAfter(today)) {
      setDateError('A data final não pode ser posterior ao dia atual');
      return;
    }

    if (startDate && newValue && newValue.isBefore(startDate)) {
      setStartDate(newValue);
    }

    setEndDate(newValue);
    setDateError('');
  };

  const handleSessionChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedSessions(event.target.value as string[]);
  };

  const handleTypeViewChange = () => {
    setComparisonType(prevType => (prevType === 'sessions' ? 'date' : 'sessions'));
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <Button
        variant="contained"
        startIcon={<SwapHorizIcon />}
        onClick={handleTypeViewChange}
        sx={{
          ':hover': {
            backgroundColor: 'transparent',
            outline: `2px solid ${theme.palette.primary.main}`,
            color: 'primary.main',
            boxShadow: 'none',
          },
          boxShadow: 'none',
        }}
      >
        Alternar filtro
      </Button>

      <Box display="flex" gap={2} justifyContent="center" alignItems="center">
        {comparisonType === 'sessions' ? (
          <FormControl sx={{ minWidth: '230px' }} size="small">
            <InputLabel id="session-selection-label">Sessões</InputLabel>
            <Select
              labelId="session-selection-label"
              multiple
              value={selectedSessions}
              onChange={handleSessionChange}
              input={<OutlinedInput label="Sessões" />}
              renderValue={selected => {
                const selectedArray = selected as string[];
                const maxVisible = 2;
                const visibleSessions = selectedArray.slice(0, maxVisible);
                const remainingCount = selectedArray.length - maxVisible;

                return (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: '200px' }}>
                    {visibleSessions.map(value => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                    {remainingCount > 0 && (
                      <Chip
                        label={`+${remainingCount}`}
                        size="small"
                        sx={{ backgroundColor: 'transparent' }}
                      />
                    )}
                  </Box>
                );
              }}
            >
              {availableSessions.map(session => (
                <MenuItem key={session} value={session}>
                  <Checkbox checked={selectedSessions.indexOf(session) > -1} />
                  <ListItemText primary={session} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Box display="flex" gap={1} alignItems="center" flexDirection="column">
            <Box display="flex" gap={1} alignItems="center">
              <DatePicker
                label="Data de início"
                value={startDate}
                onChange={handleStartDateChange}
                slotProps={{
                  textField: {
                    size: 'small',
                    error: !!dateError,
                    helperText: dateError,
                  },
                }}
                maxDate={moment()}
              />
              <Typography>até</Typography>
              <DatePicker
                label="Data de fim"
                value={endDate}
                onChange={handleEndDateChange}
                slotProps={{
                  textField: {
                    size: 'small',
                    error: !!dateError,
                    helperText: dateError,
                  },
                }}
                maxDate={moment()}
              />
            </Box>
            {startDate && endDate && startDate.isAfter(endDate) && (
              <Typography color="error" variant="caption">
                A data inicial não pode ser posterior à data final
              </Typography>
            )}
          </Box>
        )}
      </Box>
      <Box>
        <ButtonGroup
          variant="contained"
          sx={{
            bgcolor: 'primary.main',
            ':hover': {
              boxShadow: 'none',
            },
            boxShadow: 'none',
          }}
        >
          <IconButton>
            <CachedRoundedIcon sx={{ color: 'white' }} />
          </IconButton>
          <IconButton>
            <ClearRoundedIcon sx={{ color: 'white' }} />
          </IconButton>
        </ButtonGroup>
      </Box>
    </Box>
  );
};

export default SessionComparison;
