import { SxProps } from '@mui/material';
import { HeaderSize } from '../../utils/constants';

export const appBarStyle: SxProps = {
  backgroundColor: '#fff',
};

export const containerStyle: SxProps = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: HeaderSize,
  px: 4,
};

export const logoLinkStyle: SxProps = {
  p: 0.5,
};

export const linkBoxStyle: SxProps = {
  p: 2,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  color: 'inherit',
};

export const textStyle: SxProps = {
  textAlign: 'center',
  mr: 2,
  fontSize: '1rem',
  fontWeight: 500,
};

export const qrImageStyle = {
  verticalAlign: 'middle',
};

export const navbarActions = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 2,
};
