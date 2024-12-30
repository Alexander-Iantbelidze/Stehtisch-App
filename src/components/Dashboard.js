import React, { useState, useEffect, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Box,
  Paper,
  CircularProgress,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { PlayArrow, Stop, ExitToApp } from '@mui/icons-material';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import DeskHeightCalculator from './DeskHeightCalculator/DeskHeightCalculator';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import Settings from '@mui/icons-material/Settings';

function Dashboard({ user }) {
  const [isStanding, setIsStanding] = useState(false);
  const [startTime, setStartTime] = useState(null);
  
  const [currentSessionTime, setCurrentSessionTime] = useState(0);
  const [dailyStandingTime, setDailyStandingTime] = useState(0);
  const [averageStandingTime, setAverageStandingTime] = useState(0);
  
  const [longestSessionTime, setLongestSessionTime] = useState(0);

  const [currentTeam, setCurrentTeam] = useState(null);

  const fetchCurrentTeam = useCallback(async () => {
    try {
      // Teams, die vom Benutzer erstellt wurden
      const createdTeamsQuery = query(
        collection(db, 'teams'),
        where('adminId', '==', user.uid)
      );
      const createdTeamsSnapshot = await getDocs(createdTeamsQuery);
      
      if (!createdTeamsSnapshot.empty) {
        const team = createdTeamsSnapshot.docs[0].data();
        setCurrentTeam({ id: createdTeamsSnapshot.docs[0].id, ...team });
        return;
      }
      
      // Teams, denen der Benutzer beigetreten ist
      const joinedTeamsQuery = query(
        collection(db, 'teams'),
        where('members', 'array-contains', user.uid)
      );
      const joinedTeamsSnapshot = await getDocs(joinedTeamsQuery);
      
      if (!joinedTeamsSnapshot.empty) {
        const team = joinedTeamsSnapshot.docs[0].data();
        setCurrentTeam({ id: joinedTeamsSnapshot.docs[0].id, ...team });
        return;
      }
      
      // Wenn der Benutzer in keinem Team ist
      setCurrentTeam(null);
    } catch (error) {
      console.error('Fehler beim Abrufen des Teams:', error);
    }
  }, [user.uid]);
  
  useEffect(() => {
    fetchCurrentTeam();
  }, [fetchCurrentTeam]);

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));


  
  const fetchStandingTime = useCallback(async () => {
    const q = query(
      collection(db, 'standingTimes'),
      where('userId', '==', user.uid)
    );
    const querySnapshot = await getDocs(q);

    let total = 0;
    let dailyTotal = 0;
    let sessionCount = 0;
    let longestSession = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const duration = data.duration; // Duration in seconds
      const timestamp = data.startTime.toDate();

      // Total standing time
      total += duration;

      // Count the session
      sessionCount += 1;

      // Check for longest session
      if (duration > longestSession) {
        longestSession = duration;
      }

      // Calculate daily standing time
      if (timestamp >= today) {
        dailyTotal += duration;
      }
    });

    // Average standing time
    const avgTime = sessionCount > 0 ? total / sessionCount : 0;

    // Update state variables
    setDailyStandingTime(dailyTotal);
    setAverageStandingTime(avgTime);
    setLongestSessionTime(longestSession);
  }, [user.uid]);

  useEffect(() => {
    let interval;
    if (isStanding) {
      interval = setInterval(() => {
        setCurrentSessionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStanding]);

  useEffect(() => {
    fetchStandingTime();
  }, [fetchStandingTime]);

  const handleStartStop = useCallback(async () => {
    if (isStanding) {
      const endTime = new Date();
      const duration = Math.round((endTime - startTime) / 1000);

      await addDoc(collection(db, 'standingTimes'), {
        userId: user.uid,
        startTime: startTime,
        endTime: endTime,
        duration: duration,
      });
      
      setIsStanding(false);
      setStartTime(null);
      setCurrentSessionTime(0);

      await fetchStandingTime();
    } else {
      setIsStanding(true);
      setStartTime(new Date());
    }
  }, [isStanding, startTime, user.uid, fetchStandingTime]);

  const handleLogout = () => {
    signOut(auth);
  };

  // Helper function to format time
  const formatTime = (timeInSeconds) => {
    const hrs = Math.floor(timeInSeconds / 3600);
    const mins = Math.floor((timeInSeconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <AppBar position="static" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
        <Toolbar sx={{ display: 'flex' }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            StandStrong ©
          </Typography>
          <Tooltip 
            title={currentTeam ? "" : "Du musst erst einem Team beitreten"}
            arrow
            disableHoverListener={currentTeam !== null}
          >
            <span>
              <Button 
                color="inherit" 
                component={Link} 
                to="/statistics" 
                disabled={!currentTeam}
              >
                Team Statistics
              </Button>
            </span>
          </Tooltip>
          <Button color="inherit" component={Link} to="/teams">
            Teams
          </Button>
          <Button color="inherit" component={Link} to="/create-team">
            Create Team
          </Button>
          <Button color="inherit" component={Link} to="/notifications">
            Meine Benachrichtigungen
          </Button>
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton color="inherit" component={Link} to="/settings">
              <Settings />
            </IconButton>
            <IconButton color="inherit" onClick={handleLogout}>
              <ExitToApp />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Container
        maxWidth="xl"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          py: 3,
          overflow: 'auto',
        }}
      >
        <Stack
          spacing={3}
          direction={{ xs: 'column', md: 'row' }}
          sx={{ flexGrow: 1 }}
          justifyContent="space-between"
        >
          {/* Timer Component */}
          <Paper
            elevation={3}
            sx={{
              p: 3,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxHeight: {
                lg: 650,
                xl: 'none',
              },
              overflow: 'hidden',
            }}
          >
            <Typography variant="h4" gutterBottom>
              Welcome, {user.username}
            </Typography>
            
            <Box
              sx={{
                position: 'relative',
                display: 'inline-flex',
                width: '100%',
                maxWidth: 300,
              }}
            >
              <CircularProgress
                variant="determinate"
                value={(currentSessionTime / 3600) * 100}
                size={isLargeScreen ? 200 : 150}
              />
              <Box
                sx={{
                  inset: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h5" component="div" color="text.secondary">
                  {Math.floor(currentSessionTime / 60)}:
                  {(currentSessionTime % 60).toString().padStart(2, '0')}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              color={isStanding ? 'secondary' : 'primary'}
              onClick={handleStartStop}
              startIcon={isStanding ? <Stop /> : <PlayArrow />}
              sx={{ mt: 2, width: '100%', maxWidth: 200 }}
            >
              {isStanding ? 'Stop Standing' : 'Start Standing'}
            </Button>

            {/* Statistics Overview */}
            <Box sx={{ mt: 4, width: '100%' }}>
              <Typography variant="h6">Your Statistics</Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Typography variant="body1">
                  Daily Standing Time: {formatTime(dailyStandingTime)}
                </Typography>
                <Typography variant="body1">
                  Average Session Time: {formatTime(averageStandingTime)}
                </Typography>
                
                <Typography variant="body1">
                  Longest Session: {formatTime(longestSessionTime)}
                </Typography>
                {/* You can add more statistics here */}
              </Stack>
            </Box>
          </Paper>

          {/* Desk Height Calculator */}
          <Paper
            elevation={3}
            sx={{
              p: 3,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: {
                lg: 650,
                xl: 'none',
              },
              overflow: 'hidden',
            }}
          >
            <DeskHeightCalculator />
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}

export default Dashboard;