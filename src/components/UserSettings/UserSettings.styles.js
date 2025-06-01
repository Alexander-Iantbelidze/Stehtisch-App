import { styled } from '@mui/material/styles';
import { Box, Paper, Typography, IconButton, Divider, Button } from '@mui/material';

// Root container with conditional top margin
export const Root = styled(Box, { shouldForwardProp: (prop) => prop !== 'isModal' })(
  ({ theme, isModal }) => ({
    marginTop: isModal ? 0 : theme.spacing(5),
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  })
);

// Paper wrapper with conditional shadow and border radius
export const SettingsPaper = styled(Paper, { shouldForwardProp: (prop) => prop !== 'isModal' })(
  ({ theme, isModal }) => ({
    padding: theme.spacing(3),
    width: '100%',
    maxWidth: 600,
    boxShadow: isModal ? 'none' : undefined,
    borderRadius: isModal ? 0 : undefined,
  })
);

// Header container with title and close icon
export const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

export const HeaderTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

// Styled divider with bottom margin
export const DividerStyled = styled(Divider)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

// Section wrapper for form fields and buttons
export const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

// Button for username update with top margin
export const ChangeButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));
