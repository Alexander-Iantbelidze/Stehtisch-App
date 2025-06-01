import { styled } from '@mui/material/styles';
import { Backdrop } from '@mui/material';

// Styled Backdrop for SnackbarAlert to ensure correct z-index and background color
export const StyledBackdrop = styled(Backdrop)(({ theme }) => ({
  zIndex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
}));
