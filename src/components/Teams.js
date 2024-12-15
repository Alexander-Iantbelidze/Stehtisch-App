import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
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
    await addDoc(collection(db, 'joinRequests'), {
      teamId,
      userId: user.uid,
      status: 'pending',
      requestedAt: new Date(),
    });
    alert('Beitrittsanfrage gesendet!');
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