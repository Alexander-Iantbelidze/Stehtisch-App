import { styled } from '@mui/material/styles';
import { Box, Paper, Button } from '@mui/material';

// Wrapper box for centering the login form
export const Wrapper = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(8),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

// Styled Paper container for the form
export const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  width: '100%',
}));

// Styled form box with top margin
export const FormBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

// Submit button with vertical margins
export const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
}));

// Forgot password button with top margin
export const ForgotPasswordButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));
