import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { leaveOldTeam } from '../utils/teamUtils';
import { Backdrop, Snackbar, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const CreateTeam = ({ user, currentTeam, setCurrentTeam }) => {
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
      showAlert('Bitte einen Teamnamen eingeben.', 'warning');
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
        showAlert('Team existiert bereits.', 'warning');
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

      showAlert(`Team "${teamName}" erstellt!`, 'success');
      setTeamName('');
    } catch (error) {
      showAlert('Fehler beim Erstellen oder Wechseln des Teams.', 'error');
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

      showAlert(`Team "${teamName}" erstellt!`, 'success');
      setTeamName('');
    } catch (error) {
      showAlert('Fehler beim Erstellen oder Wechseln des Teams.', 'error');
    } finally {
      setLoading(false);
      setOpenSwitchDialog(false);
    }
  };

  return (
    <>
      <Box>
        <Typography variant="h4">Neues Team erstellen</Typography>
        <TextField
          label="Teamname"
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
          {loading ? 'Erstelle Team...' : 'Team erstellen'}
        </Button>
      </Box>

      {/* Dialog zum Teamwechsel */}
      <Dialog open={openSwitchDialog} onClose={() => setOpenSwitchDialog(false)}>
        <DialogTitle>Team wechseln</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Du bist bereits im Team "{currentTeam?.name}". Möchtest du wirklich wechseln?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSwitchDialog(false)}>Abbrechen</Button>
          <Button onClick={confirmSwitchTeam} autoFocus>Bestätigen</Button>
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