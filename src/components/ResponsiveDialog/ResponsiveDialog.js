import React from 'react';
import { StyledDialog } from './ResponsiveDialog.styles';
import useResponsive from '../../hooks/useResponsive';

/**
 * Reusable dialog that is responsive: full screen on mobile, with consistent PaperProps.
 * Props:
 * - open: boolean
 * - onClose: function
 * - maxWidth: string (e.g., 'sm', 'xl')
 * - children: content (typically DialogContent and DialogActions)
 */
function ResponsiveDialog({ open, onClose, maxWidth = 'sm', children }) {
  const { isMobile } = useResponsive();

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth={maxWidth}
      fullWidth
      isMobile={isMobile}
    >
      {children}
    </StyledDialog>
  );
}

export default ResponsiveDialog;
