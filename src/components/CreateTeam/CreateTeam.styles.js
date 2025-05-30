import { styled } from '@mui/material/styles';
import { Box, Button } from '@mui/material';

// Container for CreateTeam form
export const Container = styled(Box)(({ theme }) => ({
  margin: theme.spacing(2),
}));

// Styled form button
export const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));
