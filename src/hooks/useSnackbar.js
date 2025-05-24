import { useState } from 'react';

// Custom hook to manage Snackbar alerts
export default function useSnackbar() {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  // Function to display the Snackbar with a message and severity
  const showAlert = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  // Function to close the Snackbar
  const closeSnackbar = () => {
    setOpenSnackbar(false);
  };

  return { openSnackbar, snackbarMessage, snackbarSeverity, showAlert, closeSnackbar };
}
