import React, { useState } from 'react';
import { Button, Fab, useTheme, useMediaQuery, Box, IconButton, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import { useInstall } from '../../contexts/InstallContext';

interface InstallButtonProps {
  variant?: 'fab' | 'button';
}

export const InstallButton: React.FC<InstallButtonProps> = ({ variant = 'button' }) => {
  const { showInstallButton, handleInstallClick } = useInstall();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isVisible, setIsVisible] = useState(true);

  if (!showInstallButton || !isVisible) return null;

  if (variant === 'fab' || isMobile) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: theme.zIndex.speedDial,
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Fab
            color="primary"
            onClick={handleInstallClick}
            sx={{
              bgcolor: 'orangeVictus',
              '&:hover': {
                bgcolor:
                  theme.palette.mode === 'light'
                    ? 'rgba(246, 150, 79, 0.8)'
                    : 'rgba(246, 150, 79, 0.6)',
              },
            }}
          >
            <DownloadIcon />
          </Fab>
          <IconButton
            size="small"
            onClick={() => setIsVisible(false)}
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              color: 'black',
              width: 20,
              height: 20,

              '& .MuiSvgIcon-root': {
                fontSize: 16,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography
            sx={{
              position: 'absolute',
              bottom: -24,
              right: 0,
              fontSize: '0.75rem',
              color: 'text.secondary',
              whiteSpace: 'nowrap',
            }}
          >
            Instalar App
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Button
      variant="contained"
      onClick={handleInstallClick}
      startIcon={<DownloadIcon />}
      sx={{
        bgcolor: 'orangeVictus',
        '&:hover': {
          bgcolor:
            theme.palette.mode === 'light' ? 'rgba(246, 150, 79, 0.8)' : 'rgba(246, 150, 79, 0.6)',
        },
      }}
    >
      Instalar App
    </Button>
  );
};
