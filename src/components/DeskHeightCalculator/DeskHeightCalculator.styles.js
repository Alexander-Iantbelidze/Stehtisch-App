import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

// Root container for calculator
export const Container = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

// Preview area for large screens
export const Preview = styled(Box)(({ theme }) => ({
  flex: 1,
  minHeight: 300,
  overflow: 'hidden',
}));

// Mobile stats container
export const MobileStats = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

// Row for mobile recommended heights
export const Row = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1),
}));

// Current setting box on mobile
export const CurrentBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1),
  backgroundColor: '#f5f5f5',
  borderRadius: theme.shape.borderRadius,
}));

// Form container
export const Form = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

// Bold span for value highlights
export const BoldSpan = styled('span')(({ theme }) => ({
  fontWeight: 'bold',
  marginLeft: theme.spacing(1),
}));

// Mobile header for recommended heights with bottom margin
export const MobileHeader = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));
