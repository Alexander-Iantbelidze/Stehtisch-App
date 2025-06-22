import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, arrayUnion, getDocs, deleteDoc } from 'firebase/firestore';
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
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const notifList = [];
      
      for (const docSnap of querySnapshot.docs) {
        const notifData = { id: docSnap.id, ...docSnap.data() };
        
        // Prüfen, ob die zugehörige JoinRequest noch existiert und pending ist
        if (notifData.joinRequestId) {
          try {
            const joinReqSnap = await getDoc(doc(db, 'joinRequests', notifData.joinRequestId));
            if (joinReqSnap.exists() && joinReqSnap.data().status === 'pending') {
              notifList.push(notifData);
            }
          } catch (error) {
            // JoinRequest existiert nicht mehr - Benachrichtigung nicht anzeigen
            console.log('JoinRequest nicht gefunden:', notifData.joinRequestId);
          }
        } else {
          // Benachrichtigungen ohne joinRequestId (falls vorhanden) immer anzeigen
          notifList.push(notifData);
        }
      }
      
      setNotifications(notifList);
    });
    return () => unsubscribe();
  }, [user.uid]);  const handleAccept = async (notif) => {
    try {
      // 1. JoinRequest als akzeptiert markieren
      const joinReqRef = doc(db, 'joinRequests', notif.joinRequestId);
      await updateDoc(joinReqRef, { status: 'accepted' });

      // 2. Alle anderen pending JoinRequests dieses Users löschen
      const otherRequestsQuery = query(
        collection(db, 'joinRequests'),
        where('userId', '==', notif.senderId),
        where('status', '==', 'pending')
      );
      const otherRequestsSnapshot = await getDocs(otherRequestsQuery);
      
      for (const requestDoc of otherRequestsSnapshot.docs) {
        if (requestDoc.id !== notif.joinRequestId) {
          // JoinRequest löschen
          await deleteDoc(doc(db, 'joinRequests', requestDoc.id));
          
          // Dazugehörige Benachrichtigungen löschen
          const relatedNotificationsQuery = query(
            collection(db, 'notifications'),
            where('joinRequestId', '==', requestDoc.id)
          );
          const relatedNotificationsSnapshot = await getDocs(relatedNotificationsQuery);
          for (const notificationDoc of relatedNotificationsSnapshot.docs) {
            await deleteDoc(doc(db, 'notifications', notificationDoc.id));
          }
        }
      }
  
      // 3. Referenz auf das neue Team holen
      const teamRef = doc(db, 'teams', notif.teamId);
  
      // 4. Alte Teams verlassen, um nur in einem Team zu sein
      await leaveOldTeam(notif.senderId, notif.teamId);
  
      // 5. User ins neue Team schreiben
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
      // JoinRequest ablehnen
      const joinReqRef = doc(db, 'joinRequests', notif.joinRequestId);
      await updateDoc(joinReqRef, { status: 'rejected' });

      // Benachrichtigung als gelesen markieren
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