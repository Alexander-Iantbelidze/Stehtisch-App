import React from 'react';
import { Dialog } from '@mui/material';
import useResponsive from '../hooks/useResponsive';

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
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          m: isMobile ? 0 : 2,
          borderRadius: isMobile ? 0 : 2,
          height: isMobile ? '100%' : 'auto',
          maxHeight: isMobile ? '100%' : '90vh',
        },
      }}
    >
      {children}
    </Dialog>
  );
}

export default ResponsiveDialog;
