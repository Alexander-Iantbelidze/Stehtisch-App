import { useState } from 'react';
import { auth, db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { TextField, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { leaveOldTeam } from '../../utils/teamUtils';
import useSnackbar from '../../hooks/useSnackbar';
import SnackbarAlert from '../SnackbarAlert/SnackbarAlert';
import {
  Root,
  SettingsPaper,
  HeaderContainer,
  HeaderTitle,
  CloseButton,
  DividerStyled,
  Section,
  ChangeButton
} from './UserSettings.styles';

function UserSettings({ user, setUser, isModal = false, onClose }) {
  const { t } = useTranslation();
  const [newUsername, setNewUsername] = useState('');
  const [password, setPassword] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { openSnackbar, snackbarMessage, snackbarSeverity, showAlert, closeSnackbar } = useSnackbar();

  const handleUpdateUsername = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(newUsername)) {
      showAlert(t('usernameNoEmail'), 'warning');
      return;
    }
    const userRef = doc(db, 'users', user.uid);
    try {
      // Prüfung auf Benutzernamen-Kollision
      const q = query(collection(db, 'users'), where('username', '==', newUsername));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        showAlert(t('usernameTaken'), 'warning');
        return;
      }
      await updateDoc(userRef, { username: newUsername });
      const updateUsernameIntheUI = async () => {
        const updatedDoc = await getDoc(userRef);
        setUser({
          ...user,
          ...updatedDoc.data()
        });
      };
      updateUsernameIntheUI();
      showAlert(t('usernameUpdated'), 'success');
      setNewUsername('');
    } catch (error) {
      console.error(error);
      showAlert(t('usernameUpdateError'), 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!showPassword) {
      setShowPassword(true);
    } else {
      setOpenDeleteDialog(true);
    }
  };

  const confirmDelete = async () => {
    setOpenDeleteDialog(false);
    if (!password.trim()) {
      showAlert(t('noPasswordError'), 'warning');
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
      if (error.code === 'auth/invalid-credential') showAlert(t('invalidPassword'), 'error');
      else showAlert(t('deleteAccountError'), 'error');
    }
  };

  return (
    <>
      <Root isModal={isModal}>
        <SettingsPaper isModal={isModal}>
          <HeaderContainer>
            <HeaderTitle variant="h5">
              {t('accountSettings')}
            </HeaderTitle>
            {isModal && (
              <CloseButton onClick={onClose} size="small" color="primary">
                <CancelIcon />
              </CloseButton>
            )}
          </HeaderContainer>

          <DividerStyled />

          <Section>
            <TextField
              label={t('newUsernameLabel')}
              variant="outlined"
              fullWidth
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              size={isModal ? "small" : "medium"}
            />
            <ChangeButton
              variant="contained"
              onClick={handleUpdateUsername}
              size={isModal ? "small" : "medium"}
            >
              {t('changeUsername')}
            </ChangeButton>
          </Section>

          {showPassword && (
          <Section>
            <TextField
              label={t('password')}
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              size={isModal ? "small" : "medium"}
            />
          </Section>
          )}

          <Section>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteAccount}
              size={isModal ? "small" : "medium"}
            >
              {t('deleteAccount')}
            </Button>
          </Section>
        </SettingsPaper>
      </Root>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>{t('deleteAccountTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('deleteAccountMessage')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>{t('cancel')}</Button>
          <Button onClick={confirmDelete} autoFocus>
            {t('confirmDelete')}
          </Button>
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
}

export default UserSettings;