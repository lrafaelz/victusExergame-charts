import { Box, IconButton, Typography } from '@mui/material';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
interface PageHeaderProps {
  title: string;
  idade: number;
  detalhes: string;
  onBack?: () => void;
}

export const PageHeader = ({ title, idade, detalhes, onBack }: PageHeaderProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton onClick={onBack} sx={{ display: { xs: 'block', md: 'none' } }}>
        <ArrowBackIosNewRoundedIcon color="primary" />
      </IconButton>
      <Box>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="textDisabled" fontWeight={600}>
          {idade} anos
        </Typography>
        <Typography variant="body2" color="textDisabled">
          {detalhes}
        </Typography>
      </Box>
    </Box>
  );
};
