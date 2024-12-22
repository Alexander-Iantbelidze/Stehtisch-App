import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, getDoc 
} from 'firebase/firestore';
import { Box, Typography, List, ListItem, Button } from '@mui/material';

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
    // JoinRequest als accepted markieren
    const joinReqRef = doc(db, 'joinRequests', notif.joinRequestId);
    await updateDoc(joinReqRef, { status: 'accepted' });

    // Bestehende Mitgliederliste abrufen
    const teamRef = doc(db, 'teams', notif.teamId);
    const teamSnap = await getDoc(teamRef);
    if (!teamSnap.exists()) {
      console.error('Team nicht gefunden.');
      return;
    }
    const teamData = teamSnap.data();
    const currentMembers = teamData.members || [];

    // Benutzer hinzufügen
    await updateDoc(teamRef, {
      members: [...currentMembers, notif.senderId],
    });

    // Benachrichtigung als gelesen markieren
    const notifRef = doc(db, 'notifications', notif.id);
    await updateDoc(notifRef, { read: true });

    alert('Beitritt akzeptiert!');
  } catch (error) {
    console.error('Fehler beim Akzeptieren der Anfrage:', error);
    alert('Fehler beim Akzeptieren der Anfrage.');
  }
};


  const handleReject = async (notif) => {
    try {
      // Update JoinRequest status
      const joinReqRef = doc(db, 'joinRequests', notif.joinRequestId);
      await updateDoc(joinReqRef, { status: 'rejected' });

      // Mark notification as read
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
            <ListItem key={notif.id} divider sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
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