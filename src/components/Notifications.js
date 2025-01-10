import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, getDoc,
  arrayUnion,
} from 'firebase/firestore';
import { Box, Typography, List, ListItem, Button, Backdrop, Snackbar, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { leaveOldTeam } from '../utils/teamUtils';

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

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

  const showAlert = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

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
        
      showAlert('Team existiert nicht mehr.', 'error');
        return;
      }
  
      // 6. Benachrichtigung als gelesen markieren
      const notifRef = doc(db, 'notifications', notif.id);
      await updateDoc(notifRef, { read: true });
  
      showAlert(`Beitritt zum Team "${teamSnap.data().name}" akzeptiert!`, 'info');
    } catch (error) {
      
      showAlert('Fehler beim Akzeptieren der Anfrage.', 'error');
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

      showAlert('Beitritt abgelehnt!', 'error');
    } catch (error) {
      
      showAlert('Fehler beim Ablehnen der Anfrage.', 'error');
    }
  };

 

  return (
    <Box sx={{ padding: 3 }}>
      {notifications.length === 0 ? (
        <Typography variant="h5">Keine neuen Benachrichtigungen.</Typography>
      ) : (
        <List>
          {notifications.map((notif) => (
            <ListItem 
              key={notif.id} 
              divider 
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
            >
              <Typography variant="body1" sx={{ mb: 1 }}>
                {notif.message}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleAccept(notif)}
                >
                  Akzeptieren
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleReject(notif)}
                >
                  Ablehnen
                </Button>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
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
    </Box>
  );
};

export default Notifications;