import { styled } from '@mui/material/styles';
import { Paper, Box, Button } from '@mui/material';

// Root Paper container for the timer panel
export const Root = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(4),
  // Responsive max height
  [theme.breakpoints.up('lg')]: {
    maxHeight: 650,
  },
  [theme.breakpoints.up('xl')]: {
    maxHeight: 'none',
  },
  overflow: 'hidden',
}));

// Circular container for session timer, positions relative for ripple effect
export const CircleContainer = styled(Box, { shouldForwardProp: (prop) => prop !== 'isLargeScreen' })(
  ({ theme, isLargeScreen }) => ({
    position: 'relative',
    width: isLargeScreen ? 200 : 150,
    height: isLargeScreen ? 200 : 150,
    borderRadius: '50%',
    border: `2px solid ${theme.palette.primary.main}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    overflow: 'visible',
  })
);

// Styled Button for start/stop with top margin and max width
export const StartStopButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  width: '100%',
  maxWidth: 200,
}));

// Styled component for the ripple effect on standing
export const Ripple = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  animation: 'ripple 1.5s infinite ease-in-out',
  border: `2px solid ${theme.palette.primary.main}`,
  '@keyframes ripple': {
    '0%': { transform: 'scale(1)', opacity: 0.5 },
    '100%': { transform: 'scale(1.5)', opacity: 0 },
  },
}));
