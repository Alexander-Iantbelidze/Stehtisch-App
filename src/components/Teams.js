import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, doc, getDoc, getDocs, addDoc } from 'firebase/firestore';
import { Box, TextField, List, ListItem, Button, Typography } from '@mui/material';

const Teams = ({ user }) => {
  const [search, setSearch] = useState('');
  const [teams, setTeams] = useState([]);
  const [joinRequestsMap, setJoinRequestsMap] = useState({});
  const [currentTeam, setCurrentTeam] = useState(null);

  useEffect(() => {
    const fetchJoinRequests = async () => {
      const q = query(collection(db, 'joinRequests'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const tempMap = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        tempMap[data.teamId] = data.status;
      });
      setJoinRequestsMap(tempMap);
    };
    fetchJoinRequests();
  }, [user.uid]);

  useEffect(() => {
    const fetchTeams = async () => {
      const q = query(collection(db, 'teams'), where('name', '>=', search), where('name', '<=', search + '\uf8ff'));
      const querySnapshot = await getDocs(q);
      const teamList = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== user.uid) {
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

  useEffect(() => {
    const fetchCurrentTeam = async () => {
      const createdTeamsQuery = query(
        collection(db, 'teams'),
        where('members', 'array-contains', user.uid)
      );
      const snapshot = await getDocs(createdTeamsQuery);
      if (!snapshot.empty) {
        const teamData = snapshot.docs[0].data();
        setCurrentTeam({ id: snapshot.docs[0].id, ...teamData });
      } else {
        setCurrentTeam(null);
      }
    };
    fetchCurrentTeam();
  }, [user.uid]);

  const handleJoin = async (teamId) => {
    try {
      const joinRequestRef = await addDoc(collection(db, 'joinRequests'), {
        teamId,
        userId: user.uid,
        status: 'pending',
        requestedAt: new Date(),
      });
  
      const teamDocRef = doc(db, 'teams', teamId);
      const teamDoc = await getDoc(teamDocRef);
      const teamData = teamDoc.data();
      const teamAdminId = teamData.adminId;
  
      await addDoc(collection(db, 'notifications'), {
        userId: teamAdminId,
        senderId: user.uid,
        message: `${user.username} möchte Ihrem Team beitreten.`,
        read: false,
        joinRequestId: joinRequestRef.id,
        teamId: teamId,
        createdAt: new Date(),
      });
  
      setJoinRequestsMap((prev) => ({ ...prev, [teamId]: 'pending' }));
  
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
        {teams.map((team) => {
          const requestStatus = joinRequestsMap[team.id];
          const isCurrentTeam = currentTeam && currentTeam.id === team.id;
          
          const disabledButton = isCurrentTeam || requestStatus === 'pending';

          return (
            <ListItem key={team.id} divider>
              <Typography>{team.name}</Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleJoin(team.id)}
                disabled={disabledButton}
                sx={{ ml: 'auto' }}
              >
                {isCurrentTeam 
                  ? 'Aktuelles Team' 
                  : requestStatus === 'pending' 
                    ? 'Beitrittsanfrage ausstehend'
                    : 'Team beitreten'
                }
              </Button>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default Teams;