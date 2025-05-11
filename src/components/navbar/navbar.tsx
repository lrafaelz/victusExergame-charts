import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, AppBar, Typography, Link, useTheme, Button } from '@mui/material';

import {
  logo2,
  // qrCode
} from '../../assets';
import {
  containerStyle,
  logoLinkStyle,
  textStyle,
  // qrImageStyle,
  navbarActions,
} from './navbar.styles';
import { useNavbar } from './navbar.functions';
import { InstallButton } from '../InstallButton/InstallButton';

export function Navbar() {
  const { user, onLogout } = useNavbar();
  const theme = useTheme();

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        bgcolor: 'white',
        boxShadow: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container disableGutters maxWidth={false} sx={containerStyle}>
        <Box component={RouterLink} to="/" sx={logoLinkStyle}>
          <Box component={'img'} alt="Victus Logo" src={logo2} width={'200px'} height={'auto'} />
        </Box>

        <Box sx={navbarActions}>
          <InstallButton variant="button" />
          <Link
            sx={textStyle}
            href="https://forms.gle/Z3hnWQDT6F3o1Vi76"
            target="_blank"
            rel="noopener noreferrer"
            underline="none"
          >
            <Typography>Nos avalie</Typography>
          </Link>
          {/* <Box
            component={'img'}
            src={qrCode}
            width="80px"
            height="80px"
            style={qrImageStyle}
            alt="QR Code para avaliação"
          /> */}
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <Link
              component="button"
              sx={{ ...textStyle, cursor: 'pointer' }}
              aria-describedby="logout-tooltip"
              underline="none"
            >
              <Typography>Olá, {user?.name || 'fisioterapeuta'}</Typography>
            </Link>
            <Box
              id="logout-tooltip"
              sx={{
                position: 'absolute',
                top: '100%',
                right: 0,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                display: 'none',
                zIndex: 1,
                '.MuiLink-root:hover + &, &:hover': {
                  display: 'block',
                },
                overflow: 'none',
              }}
            >
              <Button
                onClick={onLogout}
                color="error"
                sx={{
                  ...textStyle,
                  mr: 0,
                  cursor: 'pointer',
                  borderRadius: 0,
                  '&:hover, &:active': {
                    bgcolor: 'transparent',
                  },
                }}
              >
                <Typography>Deslogar</Typography>
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </AppBar>
  );
}
