import { styled } from '@mui/material/styles';
import { Box, Toolbar, IconButton, Container, Stack, Typography } from '@mui/material';

// Root layout container
export const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  overflow: 'hidden',
}));

// Header toolbar with spaced sections
export const Header = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
}));

// Left section within AppBar
export const LeftSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
}));

// Right section within AppBar
export const RightSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
}));

// Menu button in header
export const MenuButton = styled(IconButton)(({ theme }) => ({
  marginRight: theme.spacing(2),
}));

// Settings button with optional spin animation
export const SettingsButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'animate',
})(({ theme, animate }) => ({
  transition: 'transform 0.3s ease-in-out',
  '&:hover': { transform: 'rotate(30deg)' },
  animation: animate ? 'spin 0.5s ease-in-out' : 'none',
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(180deg)' },
  },
}));

// Main content container
export const Main = styled(Container)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  overflow: 'auto',
}));

// Layout stack for panels
export const Content = styled(Stack)(({ theme }) => ({
  flexGrow: 1,
}));

// Column for TimerPanel
export const Column = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
}));

// Title with responsive flex-grow
export const Title = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'isTablet',
})(({ theme, isTablet }) => ({
  display: 'block',
  flexGrow: isTablet ? 0 : 1,
}));

// Wrapper for desktop menu items
export const DesktopMenu = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
}));
