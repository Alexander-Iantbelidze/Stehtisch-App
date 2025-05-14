import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { leaveOldTeam } from '../utils/teamUtils';
import { Backdrop, Snackbar, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

const CreateTeam = ({ user, currentTeam, setCurrentTeam }) => {
  const { t } = useTranslation();
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [openSwitchDialog, setOpenSwitchDialog] = useState(false);

  const showAlert = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleCreate = async () => {
    if (!teamName.trim()) {
      showAlert(t('enterTeamName'), 'warning');
      setLoading(false);
      return;
    } 
    if (loading) return;
    setLoading(true);

    try {
      // Teamnamen prüfen
      const q = query(collection(db, 'teams'), where('name', '==', teamName.trim()));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        showAlert(t('teamExists'), 'warning');
        setLoading(false);
        return;
      }

      if (currentTeam) {
        // Anstelle des window.confirm-Dialogs
        setOpenSwitchDialog(true);
        return;
      }

      // Erstelle das neue Team
      const docRef = await addDoc(collection(db, 'teams'), {
        name: teamName.trim(),
        adminId: user.uid,
        members: [user.uid],
        createdAt: new Date(),
      });

      setCurrentTeam({
        id: docRef.id,
        name: teamName.trim(),
        adminId: user.uid,
        members: [user.uid],
        createdAt: new Date(),
      });

      showAlert(t('teamCreated', { teamName }), 'success');
      setTeamName('');
    } catch (error) {
      showAlert(t('errorCreatingOrSwitchingTeam'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmSwitchTeam = async () => {
    try {
      await leaveOldTeam(user.uid, currentTeam);

      // Setze das aktuelle Team zurück
      setCurrentTeam(null);

      // Erstelle das neue Team
      const docRef = await addDoc(collection(db, 'teams'), {
        name: teamName.trim(),
        adminId: user.uid,
        members: [user.uid],
        createdAt: new Date(),
      });

      setCurrentTeam({
        id: docRef.id,
        name: teamName.trim(),
        adminId: user.uid,
        members: [user.uid],
        createdAt: new Date(),
      });

      showAlert(t('teamCreated', { teamName }), 'success');
      setTeamName('');
    } catch (error) {
      showAlert(t('errorCreatingOrSwitchingTeam'), 'error');
    } finally {
      setLoading(false);
      setOpenSwitchDialog(false);
    }
  };

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

      {/* Dialog zum Teamwechsel */}
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

      <Backdrop
        open={openSnackbar}
        sx={{
          zIndex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)'
        }}
      />
      <Snackbar
        open={openSnackbar}
        onClose={() => {}}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbarSeverity}
          variant="filled"
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={() => setOpenSnackbar(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateTeam;