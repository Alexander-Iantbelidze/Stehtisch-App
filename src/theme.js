import { createTheme, keyframes } from '@mui/material/styles';

// Define reusable animations
const spinKeyframe = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(180deg); }
`;

const rippleKeyframe = keyframes`
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.5); opacity: 0; }
`;

// Create MUI theme including animations
const theme = createTheme({
  animations: {
    spin: spinKeyframe,
    ripple: rippleKeyframe,
  },
});

export default theme;
