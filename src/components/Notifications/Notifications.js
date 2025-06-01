import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { Typography, Button } from '@mui/material';
import {
  Container,
  StyledList,
  StyledListItem,
  Message,
  Actions
} from './Notifications.styles';
import { leaveOldTeam } from '../../utils/teamUtils';
import useSnackbar from '../../hooks/useSnackbar';
import SnackbarAlert from '../SnackbarAlert/SnackbarAlert';

const Notifications = ({ user }) => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const { openSnackbar, snackbarMessage, snackbarSeverity, showAlert, closeSnackbar } = useSnackbar();

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notifList = [];
      querySnapshot.forEach((doc) => {
        notifList.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(notifList);
    });
    return () => unsubscribe();
  }, [user.uid]);

  const handleAccept = async (notif) => {
    try {
      // 1. JoinRequest als akzeptiert markieren
      const joinReqRef = doc(db, 'joinRequests', notif.joinRequestId);
      await updateDoc(joinReqRef, { status: 'accepted' });
  
      // 2. Referenz auf das neue Team holen
      const teamRef = doc(db, 'teams', notif.teamId);
  
      // 3. Alte Teams verlassen, um nur in einem Team zu sein
      await leaveOldTeam(notif.senderId, notif.teamId);
  
      // 4. User ins neue Team schreiben
      await updateDoc(teamRef, {
        members: arrayUnion(notif.senderId),
      });
  
      // 5. Prüfen, ob das Team existiert
      const teamSnap = await getDoc(teamRef);
      if (!teamSnap.exists()) {
        showAlert(t('teamNotExist'), 'error');
        return;
      }
  
      // 6. Benachrichtigung als gelesen markieren
      const notifRef = doc(db, 'notifications', notif.id);
      await updateDoc(notifRef, { read: true });
  
      showAlert(t('acceptSuccess', { teamName: teamSnap.data().name }), 'info');
    } catch (error) {
      showAlert(t('acceptError'), 'error');
    }
  };

  const handleReject = async (notif) => {
    try {
      // Aktualisiere den Status der JoinRequest
      const joinReqRef = doc(db, 'joinRequests', notif.joinRequestId);
      await updateDoc(joinReqRef, { status: 'rejected' });

      // Markiere die Benachrichtigung als gelesen
      const notifRef = doc(db, 'notifications', notif.id);
      await updateDoc(notifRef, { read: true });

      showAlert(t('rejectSuccess'), 'error');
    } catch (error) {
      showAlert(t('rejectError'), 'error');
    }
  };

  return (
    <Container>
      {notifications.length === 0 ? (
        <Typography variant="h5">{t('noNotifications')}</Typography>
      ) : (
        <StyledList>
          {notifications.map((notif) => (
            <StyledListItem key={notif.id} divider>
              <Message variant="body1">
                {notif.message}
              </Message>
              <Actions>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleAccept(notif)}
                >
                  {t('accept')}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleReject(notif)}
                >
                  {t('reject')}
                </Button>
              </Actions>
            </StyledListItem>
          ))}
        </StyledList>
      )}
      <SnackbarAlert
        open={openSnackbar}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={closeSnackbar}
      />
    </Container>
  );
};

export default Notifications;