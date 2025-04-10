import { Box, IconButton, Typography } from '@mui/material';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
interface PageHeaderProps {
  title: string;
  description: JSX.Element | null;
  onBack?: () => void;
}

export const PageHeader = ({ title, description, onBack }: PageHeaderProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton onClick={onBack}>
        <ArrowBackIosNewRoundedIcon color="primary" />
      </IconButton>
      <Box>
        <Typography variant="h6">{title}</Typography>
        {description ? description : null}
      </Box>
    </Box>
  );
};
