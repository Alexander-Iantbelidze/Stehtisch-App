import React from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useCreateTeam from '../hooks/useCreateTeam';
import SnackbarAlert from './SnackbarAlert';

const CreateTeam = ({ user, currentTeam, setCurrentTeam }) => {
  const { t } = useTranslation();
  const {
    teamName,
    setTeamName,
    loading,
    openSwitchDialog,
    setOpenSwitchDialog,
    handleCreate,
    confirmSwitchTeam,
    openSnackbar,
    snackbarMessage,
    snackbarSeverity,
    closeSnackbar
  } = useCreateTeam(user, currentTeam, setCurrentTeam);

  return (
    <>
      <Box>
        <Typography variant="h4">{t('createNewTeam')}</Typography>
        <TextField
          label={t('teamNameLabel')}
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? t('creatingTeam') : t('createTeam')}
        </Button>
      </Box>

      <Dialog open={openSwitchDialog} onClose={() => setOpenSwitchDialog(false)}>
        <DialogTitle>{t('switchTeamTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('switchTeamMessage', { currentTeam: currentTeam?.name })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSwitchDialog(false)}>{t('cancel')}</Button>
          <Button onClick={confirmSwitchTeam} autoFocus>{t('confirm')}</Button>
        </DialogActions>
      </Dialog>

      <SnackbarAlert
        open={openSnackbar}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={closeSnackbar}
      />
    </>
  );
};

export default CreateTeam;