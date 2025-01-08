import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { TextField, Button, Typography, Paper, Box, Backdrop, Snackbar, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { leaveOldTeam } from '../utils/teamUtils';

function UserSettings({ user, setUser }) {
  const [newUsername, setNewUsername] = useState('');
  const [password, setPassword] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const showAlert = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleUpdateUsername = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(newUsername)) {
      showAlert('Bitte keine E-Mail-Adresse als Benutzername verwenden.', 'warning');
      return;
    }
    const userRef = doc(db, 'users', user.uid);
    try {
      // Prüfung auf Benutzernamen-Kollision
      const q = query(collection(db, 'users'), where('username', '==', newUsername));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        showAlert('Benutzername bereits vergeben.', 'warning');
        return;
      }
      await updateDoc(userRef, { username: newUsername });
      setUser((prev) => ({ ...prev, username: newUsername }));
      showAlert('Benutzername aktualisiert!', 'success');
      setNewUsername('');
    } catch (error) {
      console.error(error);
      showAlert('Fehler beim Ändern des Benutzernamens.', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    setOpenDeleteDialog(true);
  };

  const handleShowPassword = async () => {
    setShowPassword(true);
  };

  const confirmDelete = async () => {
    setOpenDeleteDialog(false);
    if (!password.trim()) {
      showAlert('Bitte geben Sie Ihr Passwort ein.', 'warning');
      return;
    }
    try {
      // Schritt 0: Neu authentifizieren
      const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);
      // 1) Alle standingTimes des Users löschen
      const standingTimesQ = query(collection(db, 'standingTimes'), where('userId', '==', user.uid));
      const standingTimesSnap = await getDocs(standingTimesQ);
      for (const docSnap of standingTimesSnap.docs) {
        await deleteDoc(doc(db, 'standingTimes', docSnap.id));
      }

      // 2) Alle Benachrichtigungen löschen
      const notifQ = query(collection(db, 'notifications'), where('senderId', '==', user.uid));
      const notifSnap = await getDocs(notifQ);
      for (const docSnap of notifSnap.docs) {
        await deleteDoc(doc(db, 'notifications', docSnap.id));
      }
      const notifQ2 = query(collection(db, 'notifications'), where('userId', '==', user.uid));
      const notifSnap2 = await getDocs(notifQ2);
      for (const docSnap of notifSnap2.docs) {
        await deleteDoc(doc(db, 'notifications', docSnap.id));
      }

      // 3) Alle JoinRequests löschen
      const jrQ = query(collection(db, 'joinRequests'), where('userId', '==', user.uid));
      const jrSnap = await getDocs(jrQ);
      for (const docSnap of jrSnap.docs) {
        await deleteDoc(doc(db, 'joinRequests', docSnap.id));
      }

      // 4) User aus allen Teams entfernen (Logik aus leaveOldTeam)
      await leaveOldTeam(user.uid, null);

      // 5) Users-Eintrag löschen
      await deleteDoc(doc(db, 'users', user.uid));

      // 6) Firebase Auth Löschung
      await deleteUser(auth.currentUser);

      navigate('/');
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/invalid-credential') {
        showAlert('Das eingegebene Passwort war falsch.', 'error');
      } else {
        showAlert('Fehler beim Löschen des Accounts.', 'error');
      }
    }
  };

  return (
    <>
      <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
        <Paper sx={{ p: 3, width: '100%', maxWidth: 600 }}>
          <Typography variant="h5" gutterBottom>
            Einstellungen
          </Typography>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Neuer Benutzername"
              variant="outlined"
              fullWidth
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <Button variant="contained" sx={{ mt: 1 }} onClick={handleUpdateUsername}>
              Benutzername ändern
            </Button>
          </Box>
          {showPassword && (
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Passwort"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </Box>
          )}
          <Box>
            <Button variant="contained" color="error" onClick={handleDeleteAccount} onMouseEnter={handleShowPassword}>
              Account löschen
            </Button>
          </Box>
        </Paper>
      </Box>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Account löschen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sind Sie sicher, dass Sie Ihren Account unwiderruflich löschen möchten?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Abbrechen</Button>
          <Button onClick={confirmDelete} autoFocus>
            Löschen
          </Button>
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
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => {}}
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
}

export default UserSettings;