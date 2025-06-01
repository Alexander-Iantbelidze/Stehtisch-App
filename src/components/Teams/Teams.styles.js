import { styled } from '@mui/material/styles';
import { Box, Typography, Button } from '@mui/material';

// Root container for Teams component
export const Root = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

// Styled team name with ellipsis for overflow
export const TeamName = styled(Typography)(({ theme }) => ({
  maxWidth: 150,
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
}));

// Button with left auto margin to push it to the right
export const JoinButton = styled(Button)(({ theme }) => ({
  marginLeft: 'auto',
}));
