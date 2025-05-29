import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Box,
  Button,
  Stack,
  Badge,
  DialogContent,
  DialogActions,
  Tooltip,
  Drawer
} from '@mui/material';
import { ExitToApp, Settings, Menu as MenuIcon } from '@mui/icons-material';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import Teams from './Teams';
import CreateTeam from './CreateTeam';
import Notifications from './Notifications';
import UserSettings from './UserSettings';
import Statistics from './Statistics';
import ResponsiveDialog from './ResponsiveDialog';
import LanguageSwitcher from './LanguageSwitcher';
import useAuth from '../hooks/useAuth';
import useNotificationsCount from '../hooks/useNotificationsCount';
import useSessionTimer from '../hooks/useSessionTimer';
import useResponsive from '../hooks/useResponsive';
import useStatsOverview from '../hooks/useStatsOverview';
import DeskCalculatorPanel from './DeskCalculatorPanel';
import NavigationDrawer from './NavigationDrawer';
import TimerPanel from './TimerPanel';

function Dashboard({ user, setUser }) {
  const { t } = useTranslation();
  const { currentTeam, setCurrentTeam } = useAuth();
  // Fetch and format standing statistics overview
  const { formattedDailyTime, formattedAverageTime, formattedLongestTime, fetchStats } = useStatsOverview(user.uid);
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
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <NavigationDrawer currentTeam={currentTeam} unreadCount={unreadCount} onMenuClick={handleMenuItemClick} />
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
        <Stack spacing={3} direction={{ xs: 'column', md: 'row' }} sx={{ flexGrow: 1 }} justifyContent="space-between">
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <TimerPanel
              user={user}
              isStanding={isStanding}
              currentSessionTime={currentSessionTime}
              toggleStanding={toggleStanding}
              isLargeScreen={isLargeScreen}
              formattedDailyTime={formattedDailyTime}
              formattedAverageTime={formattedAverageTime}
              formattedLongestTime={formattedLongestTime}
            />
          </Box>
          <DeskCalculatorPanel />
        </Stack>
      </Container>

      {/* Teams dialog */}
      <ResponsiveDialog open={openTeamsDialog} onClose={() => setOpenTeamsDialog(false)} maxWidth="sm">
        <DialogContent sx={{ p: { xs: 2, sm: 3 }, height: isMobile ? 'calc(100vh - 64px)' : 'auto', overflow: 'auto' }}>
          <Teams user={user} />
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}>
          <Button onClick={() => setOpenTeamsDialog(false)}>{t('close')}</Button>
        </DialogActions>
      </ResponsiveDialog>

      {/* CreateTeam dialog */}
      <ResponsiveDialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm">
        <DialogContent sx={{ p: { xs: 2, sm: 3 }, height: isMobile ? 'calc(100vh - 64px)' : 'auto', overflow: 'auto' }}>
          <CreateTeam user={user} currentTeam={currentTeam} setCurrentTeam={setCurrentTeam} />
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}>
          <Button onClick={() => setOpenCreateDialog(false)}>{t('close')}</Button>
        </DialogActions>
      </ResponsiveDialog>

      {/* Notifications dialog */}
      <ResponsiveDialog open={openNotificationsDialog} onClose={() => setOpenNotificationsDialog(false)} maxWidth="sm">
        <DialogContent sx={{ p: { xs: 2, sm: 3 }, height: isMobile ? 'calc(100vh - 64px)' : 'auto', overflow: 'auto' }}>
          <Notifications user={user} />
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}>
          <Button onClick={() => setOpenNotificationsDialog(false)}>{t('close')}</Button>
        </DialogActions>
      </ResponsiveDialog>

      {/* Settings modal */}
      <ResponsiveDialog open={openSettingsModal} onClose={() => setOpenSettingsModal(false)} maxWidth="sm">
        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          <UserSettings user={user} setUser={setUser} isModal onClose={() => setOpenSettingsModal(false)} />
        </DialogContent>
      </ResponsiveDialog>

      {/* Statistics dialog */}
      <ResponsiveDialog open={openStatisticsDialog} onClose={() => setOpenStatisticsDialog(false)} maxWidth="xl">
        <DialogContent sx={{ p: { xs: 1, sm: 2, md: 3 }, height: isMobile ? 'calc(100vh - 64px)' : 'auto', overflow: 'auto' }}>
          <Statistics user={user} teamId={currentTeam?.id} />
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1, sm: 2 }, pt: 0 }}>
          <Button onClick={() => setOpenStatisticsDialog(false)}>{t('close')}</Button>
        </DialogActions>
      </ResponsiveDialog>
    </Box>
  );
}

export default Dashboard;