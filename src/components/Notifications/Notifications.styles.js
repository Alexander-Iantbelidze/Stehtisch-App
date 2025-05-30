import { styled } from '@mui/material/styles';
import { Box, List, ListItem, Typography } from '@mui/material';

// Wrapper container with padding
export const Container = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

// List without default padding
export const StyledList = styled(List)(() => ({
  padding: 0,
}));

// ListItem with vertical layout
export const StyledListItem = styled(ListItem)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
}));

// Message typography with bottom margin
export const Message = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

// Actions container for buttons
export const Actions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
}));
