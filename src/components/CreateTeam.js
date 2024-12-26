import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { leaveOldTeam } from '../utils/teamUtils';

const CreateTeam = ({ user, currentTeam, setCurrentTeam }) => {
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (currentTeam) {
        const confirmSwitch = window.confirm(
          `Du bist bereits im Team "${currentTeam.name}". Möchtest du wirklich wechseln?`
        );
        if (!confirmSwitch) {
          setLoading(false);
          return;
        }

        await leaveOldTeam(user.uid, currentTeam);

        // Setze das aktuelle Team zurück
        setCurrentTeam(null);
      }

      if (!teamName.trim()) {
        alert('Bitte einen Teamnamen eingeben.');
        setLoading(false);
        return;
      }

      // Erstelle das neue Team
      const docRef = await addDoc(collection(db, 'teams'), {
        name: teamName.trim(),
        adminId: user.uid,
        members: [user.uid],
        createdAt: new Date(),
      });

      setCurrentTeam({
        id: docRef.id,
        name: teamName.trim(),
        adminId: user.uid,
        members: [user.uid],
        createdAt: new Date(),
      });

      alert(`Team "${teamName}" erstellt!`);
      setTeamName('');
    } catch (error) {
      console.error('Fehler beim Erstellen oder Wechseln des Teams:', error);
      alert('Fehler beim Erstellen oder Wechseln des Teams.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4">Neues Team erstellen</Typography>
      <TextField
        label="Teamname"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreate}
        disabled={loading}
      >
        {loading ? 'Erstelle Team...' : 'Team erstellen'}
      </Button>
    </Box>
  );
};

export default CreateTeam;