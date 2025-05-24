import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  Badge,
  Dialog,
  DialogContent,
  DialogActions,
  Tooltip,
  Grow,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  ExitToApp,
  Settings,
  Menu as MenuIcon,
  BarChart as StatisticsIcon,
  GroupAdd as JoinTeamIcon,
  AddCircle as CreateTeamIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import DeskHeightCalculator from './DeskHeightCalculator/DeskHeightCalculator';
import Teams from './Teams'; 
import CreateTeam from './CreateTeam';
import Notifications from './Notifications';
import UserSettings from './UserSettings';
import Statistics from './Statistics';
import LanguageSwitcher from './LanguageSwitcher';
import useAuth from '../hooks/useAuth';
import useNotificationsCount from '../hooks/useNotificationsCount';
import useStandingStats from '../hooks/useStandingStats';
import useSessionTimer from '../hooks/useSessionTimer';
import useResponsive from '../hooks/useResponsive';

function Dashboard({ user, setUser }) {
  const { t } = useTranslation();
  const { currentTeam, setCurrentTeam } = useAuth();
  // Fetch standing statistics
  const { dailyStandingTime, averageStandingTime, longestSessionTime, fetchStats } = useStandingStats(user.uid);
  // Manage session timer and record standing sessions
  const { isStanding, currentSessionTime, toggleStanding } = useSessionTimer(user.uid, fetchStats);

  const unreadCount = useNotificationsCount(user.uid);
  const [openTeamsDialog, setOpenTeamsDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openNotificationsDialog, setOpenNotificationsDialog] = useState(false);
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const [openStatisticsDialog, setOpenStatisticsDialog] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Responsive breakpoints via custom hook
  const { isMobile, isTablet, isLargeScreen } = useResponsive();
  const isAdmin = currentTeam?.adminId === user.uid;

  // session timer handled by useSessionTimer hook

  // Standing stats provided by useStandingStats hook

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // notifications count handled by useNotificationsCount hook

  // toggleStanding handles start/stop, Firestore record and stats refresh

  const handleLogout = () => {
    signOut(auth);
  };

  const handleSettingsClick = () => {
    setOpenSettingsModal(true);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuItemClick = (action) => {
    setDrawerOpen(false);
    
    if (action === 'statistics' && currentTeam) {
      setOpenStatisticsDialog(true);
    } else if (action === 'joinTeam') {
      setOpenTeamsDialog(true);
    } else if (action === 'createTeam') {
      setOpenCreateDialog(true);
    } else if (action === 'notifications') {
      setOpenNotificationsDialog(true);
    }
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

  // Sidebar content
  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <List sx={{ p: 0, '& .MuiListItemButton-root': { px: 2 }, '& .MuiListItemIcon-root': { minWidth: 0, mr: 2 }, '& .MuiListItemText-root': { mr: 2, whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' } }}>
        <ListItemButton
          onClick={() => handleMenuItemClick('statistics')}
          disabled={!currentTeam}
        >
          <ListItemIcon>
            <StatisticsIcon color={currentTeam ? "primary" : "disabled"} />
          </ListItemIcon>
          <ListItemText primary={t('teamStatistics')} />
        </ListItemButton>
        
        <ListItemButton onClick={() => handleMenuItemClick('joinTeam')}>
          <ListItemIcon>
            <JoinTeamIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary={t('joinTeam')} />
        </ListItemButton>
        
        <ListItemButton onClick={() => handleMenuItemClick('createTeam')}>
          <ListItemIcon>
            <CreateTeamIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary={t('createTeam')} />
        </ListItemButton>
        
        {isAdmin && (
          <ListItemButton onClick={() => handleMenuItemClick('notifications')}>
            <ListItemIcon>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon color="primary" />
              </Badge>
            </ListItemIcon>
            <ListItemText primary={t('myNotifications')} />
          </ListItemButton>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <AppBar position="static">
        <Toolbar sx={{ 
          display: 'flex', 
          justifyContent: 'space-between'
        }}>
          {/* Left section */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {(isTablet || isMobile) && ( 
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
            )}
            <Typography
              variant="h6"
              component="div"
              sx={{
                display: 'block',
                flexGrow: isTablet ? 0 : 1
              }}
            >
              {t('appName')}
            </Typography>
          </Box>
          {(!isTablet && !isMobile) && (
            <Box>
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
                    {t('teamStatistics')}
                  </Button>
                </span>
              </Tooltip>
              <Button color="inherit" onClick={() => setOpenTeamsDialog(true)}>
                {t('joinTeam')}
              </Button>
              <Button color="inherit" onClick={() => setOpenCreateDialog(true)}>
                {t('createTeam')}
              </Button>
              {isAdmin && ( 
                <Badge badgeContent={unreadCount} color="error">
                  <Button color="inherit" onClick={() => setOpenNotificationsDialog(true)}>
                    {t('myNotifications')}
                  </Button>
                </Badge>
              )}
            </Box>
          )}

          {/* Right section - always visible */}
          <Box sx={{ display: 'flex' }}>
            <LanguageSwitcher />
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
              aria-label="settings"
            >
              <Settings />
            </IconButton>
            <IconButton color="inherit" onClick={handleLogout} aria-label="logout">
              <ExitToApp />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Responsive Drawer/Sidebar */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
      >
        {drawerContent}
      </Drawer>

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
              {t('welcome', { username: user.username })}
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
              onClick={toggleStanding}
              startIcon={isStanding ? <Stop /> : <PlayArrow />}
              sx={{ mt: 2, width: '100%', maxWidth: 200 }}
            >
              {isStanding ? t('stopStanding') : t('startStanding')}
            </Button>

            {/* Statistics Overview */}
            <Box sx={{ mt: 4, width: '100%' }}>
              <Typography variant="h6">{t('yourStatistics')}</Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Typography variant="body1">
                  {t('dailyStandingTime')}: {formatTime(dailyStandingTime)}
                </Typography>
                <Typography variant="body1">
                  {t('averageSessionTime')}: {formatTime(averageStandingTime)}
                </Typography>
                <Typography variant="body1">
                  {t('longestSession')}: {formatTime(longestSessionTime)}
                </Typography>
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

      {/* Responsive Dialogs */}
      <Dialog 
        open={openTeamsDialog} 
        onClose={() => setOpenTeamsDialog(false)}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            m: isMobile ? 0 : 2,
            borderRadius: isMobile ? 0 : 2,
            height: isMobile ? '100%' : 'auto',
            maxHeight: isMobile ? '100%' : '90vh',
          }
        }}
      >
        <DialogContent sx={{ 
          p: { xs: 2, sm: 3 },
          height: isMobile ? 'calc(100vh - 64px)' : 'auto', 
          overflow: 'auto'
        }}>
          <Teams user={user} />
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}>
          <Button onClick={() => setOpenTeamsDialog(false)}>{t('close')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openCreateDialog} 
        onClose={() => setOpenCreateDialog(false)}
        fullScreen={isMobile}
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            m: isMobile ? 0 : 2,
            borderRadius: isMobile ? 0 : 2,
            height: isMobile ? '100%' : 'auto',
            maxHeight: isMobile ? '100%' : '90vh',
          }
        }}
      >
        <DialogContent sx={{ 
          p: { xs: 2, sm: 3 },
          height: isMobile ? 'calc(100vh - 64px)' : 'auto',
          overflow: 'auto'
        }}>
          <CreateTeam user={user} currentTeam={currentTeam} setCurrentTeam={setCurrentTeam} />
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}>
          <Button onClick={() => setOpenCreateDialog(false)}>{t('close')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openNotificationsDialog} 
        onClose={() => setOpenNotificationsDialog(false)}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            m: isMobile ? 0 : 2,
            borderRadius: isMobile ? 0 : 2,
            height: isMobile ? '100%' : 'auto',
            maxHeight: isMobile ? '100%' : '90vh',
          }
        }}
      >
        <DialogContent sx={{ 
          p: { xs: 2, sm: 3 },
          height: isMobile ? 'calc(100vh - 64px)' : 'auto',
          overflow: 'auto'
        }}>
          <Notifications user={user} />
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}>
          <Button onClick={() => setOpenNotificationsDialog(false)}>{t('close')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openSettingsModal} 
        onClose={() => setOpenSettingsModal(false)}
        TransitionComponent={Grow}
        TransitionProps={{ timeout: 350, style: { transformOrigin: 'top right' } }}
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : '16px',
            position: 'relative',
            overflow: 'visible',
            width: isMobile ? '100%' : '500px',
            maxWidth: isMobile ? '100%' : '500px',
            height: isMobile ? '100%' : 'auto',
            margin: isMobile ? 0 : undefined,
            '&::before': isMobile ? {} : {
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
            justifyContent: isMobile ? 'center' : 'flex-end', 
            alignItems: isMobile ? 'center' : 'flex-start',
            paddingTop: isMobile ? 0 : '64px',
            paddingRight: isMobile ? 0 : '16px'
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
        fullScreen={isMobile}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            m: isMobile ? 0 : 2,
            borderRadius: isMobile ? 0 : 2,
            height: isMobile ? '100%' : 'auto',
            maxHeight: isMobile ? '100%' : '90vh'
          }
        }}
      >
        <DialogContent sx={{ 
          p: { xs: 1, sm: 2, md: 3 },
          height: isMobile ? 'calc(100vh - 64px)' : 'auto',
          overflow: 'auto'
        }}>
          <Statistics user={user} teamId={currentTeam?.id} />
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1, sm: 2 }, pt: 0 }}>
          <Button onClick={() => setOpenStatisticsDialog(false)}>{t('close')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Dashboard;