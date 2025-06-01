import React from 'react';
import { Snackbar, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { StyledBackdrop } from './SnackbarAlert.styles';

/**
 * Reusable component for displaying a Snackbar with an Alert and backdrop.
 */
function SnackbarAlert({ open, message, severity, onClose }) {
  return (
    <>
      <StyledBackdrop open={open} />
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={onClose}
      >
        <Alert
          severity={severity}
          variant="filled"
          action={
            <IconButton color="inherit" size="small" onClick={onClose}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default SnackbarAlert;
