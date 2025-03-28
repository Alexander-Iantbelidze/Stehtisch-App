import React, { useState, useEffect, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Box,
  Paper,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
  Badge,
  Dialog,
  DialogContent,
  DialogActions,
  Tooltip,
  Grow
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
  onSnapshot,
} from 'firebase/firestore';
import DeskHeightCalculator from './DeskHeightCalculator/DeskHeightCalculator';
import Settings from '@mui/icons-material/Settings';
import Teams from './Teams'; 
import CreateTeam from './CreateTeam';
import Notifications from './Notifications';
import UserSettings from './UserSettings';
import Statistics from './Statistics';

function Dashboard({ user, setUser }) {
  const [isStanding, setIsStanding] = useState(false);
  const [startTime, setStartTime] = useState(null);
  
  const [currentSessionTime, setCurrentSessionTime] = useState(0);
  const [dailyStandingTime, setDailyStandingTime] = useState(0);
  const [averageStandingTime, setAverageStandingTime] = useState(0);
  
  const [longestSessionTime, setLongestSessionTime] = useState(0);

  const [currentTeam, setCurrentTeam] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openTeamsDialog, setOpenTeamsDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openNotificationsDialog, setOpenNotificationsDialog] = useState(false);
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const [openStatisticsDialog, setOpenStatisticsDialog] = useState(false);

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const isAdmin = currentTeam?.adminId === user.uid;

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
    if (isStanding && startTime !== null) {
      interval = setInterval(() => {
        setCurrentSessionTime(
          Math.floor((Date.now() - startTime) / 1000)
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStanding, startTime]);

  useEffect(() => {
    fetchStandingTime();
  }, [fetchStandingTime]);

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    });
    return () => unsubscribe();
  }, [user.uid]);

  const handleStartStop = useCallback(async () => {
    if (isStanding) {
      // User stoppt das Stehen
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      await addDoc(collection(db, 'standingTimes'), {
        userId: user.uid,
        startTime: new Date(startTime), 
        endTime: new Date(endTime), 
        duration: duration
      });

      setIsStanding(false);
      setStartTime(null);
      setCurrentSessionTime(0);

      await fetchStandingTime();
    } else {
      // User startet das Stehen
      setIsStanding(true);
      setStartTime(Date.now());
    }
  }, [isStanding, startTime, user.uid, fetchStandingTime]);

  const handleLogout = () => {
    signOut(auth);
  };

  const handleSettingsClick = () => {
    setOpenSettingsModal(true);
  };

 

  // Helper function to format time
  const formatTime = (timeInSeconds) => {
    const hrs = Math.floor(timeInSeconds / 3600);
    const mins = Math.floor((timeInSeconds % 3600) / 60);
    const secs = timeInSeconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
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
                onClick={() => currentTeam && setOpenStatisticsDialog(true)}
                disabled={!currentTeam}
              >
                Team Statistics
              </Button>
            </span>
          </Tooltip>
          <Button color="inherit" onClick={() => setOpenTeamsDialog(true)}>
            Join Team
          </Button>
          <Button color="inherit" onClick={() => setOpenCreateDialog(true)}>
            Create Team
          </Button>
          { isAdmin && ( 
          <Badge badgeContent={unreadCount} color="error">
            <Button color="inherit" onClick={() => setOpenNotificationsDialog(true)}>
              Meine Benachrichtigungen
            </Button>
          </Badge>
          )}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton 
              color="inherit" 
              onClick={handleSettingsClick}
              sx={{
                transition: 'transform 0.3s ease-in-out',
                '&:hover': { transform: 'rotate(30deg)' },
                animation: openSettingsModal ? 'spin 0.5s ease-in-out' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(180deg)' }
                }
              }}
            >
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
                width: isLargeScreen ? 200 : 150,
                height: isLargeScreen ? 200 : 150,
                borderRadius: '50%',
                border: (theme) => `2px solid ${theme.palette.primary.main}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                overflow: 'visible'
              }}
            >
              {isStanding && (
                <Box
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    animation: 'ripple 1.5s infinite ease-in-out',
                    border: (theme) => `2px solid ${theme.palette.primary.main}`,
                    '@keyframes ripple': {
                      '0%': { transform: 'scale(1)', opacity: 0.5 },
                      '100%': { transform: 'scale(1.5)', opacity: 0 }
                    }
                  }}
                />
              )}
              <Typography variant="h5" color="text.secondary">
                {Math.floor(currentSessionTime / 60)}:
                {(currentSessionTime % 60).toString().padStart(2, '0')}
              </Typography>
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
      {/* Hier beginnen die ganzen Modal Dialogs die getriggert werden über die Appbar */}
      <Dialog open={openTeamsDialog} onClose={() => setOpenTeamsDialog(false)}>
        <DialogContent>
          <Teams user={user} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTeamsDialog(false)}>Schließen</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
        <DialogContent>
          <CreateTeam user={user} currentTeam={currentTeam} setCurrentTeam={setCurrentTeam} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Schließen</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openNotificationsDialog} onClose={() => setOpenNotificationsDialog(false)}>
        <DialogContent>
          <Notifications user={user} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNotificationsDialog(false)}>Schließen</Button>
        </DialogActions>
      </Dialog>
      <Dialog 
        open={openSettingsModal} 
        onClose={() => setOpenSettingsModal(false)}
        TransitionComponent={Grow}
        TransitionProps={{ timeout: 350, style: { transformOrigin: 'top right' } }}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            position: 'relative',
            overflow: 'visible',
            maxWidth: '500px',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-12px',
              right: '30px',
              width: '24px',
              height: '24px',
              backgroundColor: 'background.paper',
              transform: 'rotate(45deg)',
              zIndex: -1,
            }
          }
        }}
        sx={{
          '& .MuiDialog-container': {
            justifyContent: 'flex-end', 
            alignItems: 'flex-start',
            paddingTop: '64px',
            paddingRight: '16px'
          }
        }}
      >
        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          <UserSettings 
            user={user} 
            setUser={setUser} 
            isModal={true} 
            onClose={() => setOpenSettingsModal(false)} 
          />
        </DialogContent>
      </Dialog>
      <Dialog 
        open={openStatisticsDialog} 
        onClose={() => setOpenStatisticsDialog(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogContent>
          <Statistics user={user} teamId={currentTeam?.id} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatisticsDialog(false)}>Schließen</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Dashboard;