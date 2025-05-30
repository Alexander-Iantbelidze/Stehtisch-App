import { styled } from '@mui/material/styles';
import { Paper } from '@mui/material';

// Styled Paper container for DeskCalculatorPanel
export const StyledCalculatorPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  [theme.breakpoints.up('lg')]: { maxHeight: 650 },
  [theme.breakpoints.up('xl')]: { maxHeight: 'none' },
}));
