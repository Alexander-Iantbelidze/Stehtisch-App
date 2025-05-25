import React from 'react';
import { Backdrop, Snackbar, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Reusable component for displaying a Snackbar with an Alert and backdrop.
 */
function SnackbarAlert({ open, message, severity, onClose }) {
  return (
    <>
      <Backdrop
        open={open}
        sx={{ zIndex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      />
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
