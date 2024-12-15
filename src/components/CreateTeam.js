import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

const CreateTeam = ({ user }) => {
  const [teamName, setTeamName] = useState('');

  const handleCreate = async () => {
    if (!teamName) {
      alert('Bitte einen Teamnamen eingeben.');
      return;
    }
    await addDoc(collection(db, 'teams'), {
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