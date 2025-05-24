import { useTheme, useMediaQuery } from '@mui/material';

/**
 * Custom hook to provide responsive breakpoints across the app
 * - isMobile: screen width <= small
 * - isTablet: screen width <= medium
 * - isLargeScreen: screen width >= large
 */
export default function useResponsive() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  return { isMobile, isTablet, isLargeScreen };
}
