import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { TextField, Button, Typography, Paper, Box } from '@mui/material';
import { leaveOldTeam } from '../utils/teamUtils';

function UserSettings({ user, setUser }) {
  const [newUsername, setNewUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleUpdateUsername = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(newUsername)) {
      alert('Bitte keine E-Mail-Adresse als Benutzername verwenden.');
      return;
    }
    const userRef = doc(db, 'users', user.uid);
    try {
      // Prüfung auf Benutzernamen-Kollision
      const q = query(collection(db, 'users'), where('username', '==', newUsername));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        alert('Benutzername bereits vergeben.');
        return;
      }
      await updateDoc(userRef, { username: newUsername });
      setUser((prev) => ({ ...prev, username: newUsername }));
      alert('Benutzername aktualisiert!');
      setNewUsername('');
    } catch (error) {
      console.error(error);
      alert('Fehler beim Ändern des Benutzernamens.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      alert('Bitte geben Sie Ihr Passwort ein.');
      return;
    }
    if (!window.confirm('Möchten Sie Ihren Account wirklich löschen?')) return;
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

      alert('Account komplett gelöscht.');
      navigate('/');
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/invalid-credential') {
        alert('Das eingegebene Passwort war falsch.');
      } else {
        alert('Fehler beim Löschen des Accounts.');
      }
    }
  };

  return (
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
        <Box>
          <Button variant="contained" color="error" onClick={handleDeleteAccount}>
            Account löschen
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default UserSettings;