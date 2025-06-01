import { styled } from '@mui/material/styles';
import { Box, Stack } from '@mui/material';

// Root container for stats overview
export const Root = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  width: '100%',
}));

// Stack for statistic items with top margin
export const StatsStack = styled(Stack)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));
