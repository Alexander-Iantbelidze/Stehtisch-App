import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, doc, getDoc, getDocs, addDoc } from 'firebase/firestore';
import { Box, TextField, List, ListItem, Button, Typography } from '@mui/material';

const Teams = ({ user }) => {
  const [search, setSearch] = useState('');
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const fetchTeams = async () => {
      const q = query(collection(db, 'teams'), where('name', '>=', search), where('name', '<=', search + '\uf8ff'));
      const querySnapshot = await getDocs(q);
      const teamList = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== user.uid) { // Optional: Exclude user's own team
          teamList.push({ id: doc.id, ...doc.data() });
        }
      });
      setTeams(teamList);
    };
    if (search) {
      fetchTeams();
    } else {
      setTeams([]);
    }
  }, [search, user.uid]);

  const handleJoin = async (teamId) => {
    try {
      // Erstelle die JoinRequest
      const joinRequestRef = await addDoc(collection(db, 'joinRequests'), {
        teamId,
        userId: user.uid,
        status: 'pending',
        requestedAt: new Date(),
      });
  
      // Hole die adminId des Teams
      const teamDocRef = doc(db, 'teams', teamId);
      const teamDoc = await getDoc(teamDocRef);
      const teamData = teamDoc.data();
      const teamAdminId = teamData.adminId;
  
      // Erstelle die Benachrichtigung für den Team-Admin
      await addDoc(collection(db, 'notifications'), {
        userId: teamAdminId, // Empfänger der Benachrichtigung
        senderId: user.uid, // Absender der Benachrichtigung
        message: `${user.username} möchte Ihrem Team beitreten.`,
        read: false,
        joinRequestId: joinRequestRef.id,
        teamId: teamId,
        createdAt: new Date(),
      });
  
      alert('Beitrittsanfrage gesendet!');
    } catch (error) {
      console.error('Fehler beim Senden der Beitrittsanfrage:', error);
      alert('Fehler beim Senden der Beitrittsanfrage. Bitte versuchen Sie es erneut.');
    }
  };

  return (
    <Box>
      <Typography variant="h4">Dein Team finden!</Typography>
      <TextField
        label="Team suchen"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        margin="normal"
      />
      <List>
        {teams.map((team) => (
          <ListItem key={team.id} divider>
            <Typography>{team.name}</Typography>
            <Button variant="contained" color="primary" onClick={() => handleJoin(team.id)} sx={{ ml: 'auto' }}>
              Team beitreten
            </Button>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Teams;