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
import { Box, Typography, List, ListItem, Button } from '@mui/material';
import { leaveOldTeam } from '../utils/teamUtils';

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);

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
        console.error('Team nicht gefunden.');
        alert('Team existiert nicht mehr.');
        return;
      }
  
      // 6. Benachrichtigung als gelesen markieren
      const notifRef = doc(db, 'notifications', notif.id);
      await updateDoc(notifRef, { read: true });
  
      alert(`Beitritt zum Team "${teamSnap.data().name}" akzeptiert!`);
    } catch (error) {
      console.error('Fehler beim Akzeptieren der Anfrage:', error);
      alert('Fehler beim Akzeptieren der Anfrage.');
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

      alert('Beitritt abgelehnt!');
    } catch (error) {
      console.error('Fehler beim Ablehnen der Anfrage:', error);
      alert('Fehler beim Ablehnen der Anfrage.');
    }
  };

 

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Meine Benachrichtigungen
      </Typography>
      {notifications.length === 0 ? (
        <Typography variant="body1">Keine neuen Benachrichtigungen.</Typography>
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
    </Box>
  );
};

export default Notifications;