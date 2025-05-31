import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Button,
  Badge,
  DialogContent,
  DialogActions,
  Tooltip,
  Drawer,
  IconButton
} from '@mui/material';
import { ExitToApp, Settings, Menu as MenuIcon } from '@mui/icons-material';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import Teams from '../Teams';
import CreateTeam from '../CreateTeam';
import Notifications from '../Notifications/Notifications';
import UserSettings from '../UserSettings';
import Statistics from '../Statistics/Statistics';
import ResponsiveDialog from '../ResponsiveDialog/ResponsiveDialog';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import useAuth from '../../hooks/useAuth';
import useNotificationsCount from '../../hooks/useNotificationsCount';
import useSessionTimer from '../../hooks/useSessionTimer';
import useResponsive from '../../hooks/useResponsive';
import useStatsOverview from '../../hooks/useStatsOverview';
import DeskCalculatorPanel from '../DeskCalculatorPanel/DeskCalculatorPanel';
import NavigationDrawer from '../NavigationDrawer/NavigationDrawer';
import TimerPanel from '../TimerPanel';
import {
  Root,
  Header,
  LeftSection,
  RightSection,
  MenuButton,
  SettingsButton,
  Main,
  Content,
  Column,
  Title,
  DesktopMenu
} from './Dashboard.styles';

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
    <Root>
      <AppBar position="static">
        <Header>
          {/* Left section */}
          <LeftSection>
          {(isTablet || isMobile) && (
            <MenuButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer}
              aria-label="menu"
            >
              <MenuIcon />
            </MenuButton>
            )}
            <Title variant="h6" component="div" isTablet={isTablet}>
              {t('appName')}
            </Title>
          </LeftSection>
          {(!isTablet && !isMobile) && (
            <DesktopMenu>
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
            </DesktopMenu>
           )}

          {/* Right section - always visible */}
          <RightSection>
            <LanguageSwitcher />
            <SettingsButton animate={openSettingsModal} color="inherit" onClick={handleSettingsClick} aria-label="settings">
              <Settings />
            </SettingsButton>
            <IconButton color="inherit" onClick={handleLogout} aria-label="logout">
              <ExitToApp />
            </IconButton>
          </RightSection>
        </Header>
       </AppBar>
      
      {/* Responsive Drawer/Sidebar */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <NavigationDrawer currentTeam={currentTeam} unreadCount={unreadCount} onMenuClick={handleMenuItemClick} />
      </Drawer>

      <Main maxWidth="xl">
        <Content spacing={3} direction={{ xs: 'column', md: 'row' }} justifyContent="space-between">
          <Column>
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
          </Column>
          <DeskCalculatorPanel />
        </Content>
      </Main>

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
    </Root>
  );
}

export default Dashboard;