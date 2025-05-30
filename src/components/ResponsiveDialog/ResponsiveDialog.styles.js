import { styled } from '@mui/material/styles';
import { Dialog } from '@mui/material';

// Styled Dialog that applies responsive PaperProps styles
export const StyledDialog = styled(Dialog, {
  shouldForwardProp: (prop) => prop !== 'isMobile',
})(({ theme, isMobile }) => ({
  '& .MuiPaper-root': {
    margin: isMobile ? 0 : theme.spacing(2),
    borderRadius: isMobile ? 0 : theme.shape.borderRadius * 2,
    height: isMobile ? '100%' : 'auto',
    maxHeight: isMobile ? '100%' : '90vh',
  },
}));
