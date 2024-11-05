import React, { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { 
  AppBar, Toolbar, Typography, Button, Container, Box, 
  Paper, CircularProgress, IconButton 
} from '@mui/material';
import { PlayArrow, Stop, ExitToApp } from '@mui/icons-material';

function Dashboard({ user }) {
  const [isStanding, setIsStanding] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [totalStandingTime, setTotalStandingTime] = useState(0);
  const [currentSessionTime, setCurrentSessionTime] = useState(0);

  useEffect(() => {
    const fetchStandingTime = async () => {
      const q = query(collection(db, "standingTimes"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      let total = 0;
      querySnapshot.forEach((doc) => {
        total += doc.data().duration;
      });
      setTotalStandingTime(total);
    };

    fetchStandingTime();
  }, [user]);

  useEffect(() => {
    let interval;
    if (isStanding) {
      interval = setInterval(() => {
        setCurrentSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isStanding]);

  const handleStartStop = useCallback(async () => {
    if (isStanding) {
      const endTime = new Date();
      const duration = Math.round((endTime - startTime) / 1000);

      await addDoc(collection(db, "standingTimes"), {
        userId: user.uid,
        startTime: startTime,
        endTime: endTime,
        duration: duration
      });

      setTotalStandingTime(prevTotal => prevTotal + duration);
      setIsStanding(false);
      setStartTime(null);
      setCurrentSessionTime(0);
    } else {
      setIsStanding(true);
      setStartTime(new Date());
    }
  }, [isStanding, startTime, user.uid]);

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            StandStrong
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm">
        <Box sx={{ my: 4 }}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center'}}>
            <Typography variant="h4" gutterBottom>
              Welcome, {user.email}
            </Typography>
            <Typography variant="h6" gutterBottom>
              Total standing time: {Math.round(totalStandingTime / 60)} minutes
            </Typography>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress 
                variant="determinate" 
                value={(currentSessionTime / 3600) * 100} 
                size={200}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h5" component="div" color="text.secondary">
                  {Math.floor(currentSessionTime / 60)}:{(currentSessionTime % 60).toString().padStart(2, '0')}
                </Typography>
              </Box>
            </Box>
            <Button 
              variant="contained" 
              color={isStanding ? "secondary" : "primary"} 
              onClick={handleStartStop}
              startIcon={isStanding ? <Stop /> : <PlayArrow />}
              sx={{ mt: 2 }}
            >
              {isStanding ? 'Stop Standing' : 'Start Standing'}
            </Button>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

export default Dashboard;
