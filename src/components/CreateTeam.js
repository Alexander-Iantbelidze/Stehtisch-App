import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { addDoc, collection, doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';

const CreateTeam = ({ user, currentTeam, setCurrentTeam }) => {
  const [teamName, setTeamName] = useState('');

  const handleCreate = async () => {
    if (currentTeam) {
      const confirmSwitch = window.confirm(
        `Du bist bereits im Team "${currentTeam.name}". Möchtest du wirklich wechseln?`
      );
      if (!confirmSwitch) return;
      const oldTeamRef = doc(db, 'teams', currentTeam.id);
      await updateDoc(oldTeamRef, {
        members: arrayRemove(user.uid),
      });
    }

    if (!teamName) {
      alert('Bitte einen Teamnamen eingeben.');
      return;
    }
    const docRef = await addDoc(collection(db, 'teams'), {
      name: teamName,
      adminId: user.uid,
      members: [user.uid],
      createdAt: new Date(),
    });
    
    setCurrentTeam({
      id: docRef.id,
      name: teamName,
      adminId: user.uid,
      members: [user.uid],
      createdAt: new Date(),
    });
    alert('Team erstellt!');
    setTeamName('');
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
      <Button variant="contained" color="primary" onClick={handleCreate}>
        Team erstellen
      </Button>
    </Box>
  );
};

export default CreateTeam;