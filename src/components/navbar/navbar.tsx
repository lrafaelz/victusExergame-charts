import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Container, AppBar, Typography, Link } from '@mui/material';

import {
  logo2,
  // qrCode
} from '../../assets';
import {
  appBarStyle,
  containerStyle,
  logoLinkStyle,
  textStyle,
  // qrImageStyle,
  navbarActions,
} from './navbar.styles';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    Promise.resolve(logout()).then(() => {
      navigate('/login');
    });
  };

  return (
    <AppBar position="static" sx={appBarStyle}>
      <Container disableGutters maxWidth={false} sx={containerStyle}>
        <Box component={RouterLink} to="/" sx={logoLinkStyle}>
          <Box component={'img'} alt="Victus Logo" src={logo2} width={'200px'} height={'auto'} />
        </Box>

        <Box sx={navbarActions}>
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
                boxShadow: 1,
                p: 1,
                borderRadius: 1,
                display: 'none',
                zIndex: 1,
                '.MuiLink-root:hover + &, &:hover': {
                  display: 'block',
                },
              }}
            >
              <Link
                component="button"
                onClick={() => onLogout()}
                sx={{ ...textStyle, color: 'error.main', cursor: 'pointer' }}
                underline="none"
              >
                <Typography>Deslogar</Typography>
              </Link>
            </Box>
          </Box>
        </Box>
      </Container>
    </AppBar>
  );
}
