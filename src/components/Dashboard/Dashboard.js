import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Button,
  Badge,
  Tooltip,
  Drawer,
  IconButton
} from '@mui/material';
import { ExitToApp, Settings, Menu as MenuIcon } from '@mui/icons-material';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import Teams from '../Teams/Teams';
import CreateTeam from '../CreateTeam/CreateTeam';
import Notifications from '../Notifications/Notifications';
import UserSettings from '../UserSettings/UserSettings';
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
import TimerPanel from '../TimerPanel/TimerPanel';
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
  DesktopMenu,
  DefaultDialogContent,
  DefaultDialogActions,
  SettingsDialogContent,
  StatsDialogContent,
  StatsDialogActions
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

  // Stable callbacks for closing dialogs
  const handleCloseTeams = useCallback(() => setOpenTeamsDialog(false), []);
  const handleCloseCreate = useCallback(() => setOpenCreateDialog(false), []);
  const handleCloseNotifications = useCallback(() => setOpenNotificationsDialog(false), []);
  const handleCloseSettings = useCallback(() => setOpenSettingsModal(false), []);
  const handleCloseStatistics = useCallback(() => setOpenStatisticsDialog(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen(open => !open), []);
  const handleSettingsClick = useCallback(() => setOpenSettingsModal(true), []);
  const handleLogout = useCallback(() => signOut(auth), []);

  // Responsive breakpoints via custom hook
  const { isMobile, isTablet, isLargeScreen } = useResponsive();
  const isAdmin = currentTeam?.adminId === user.uid;

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
            <Title variant="h6" component="div" isTablet={isTablet} isMobile={isMobile}>
              {t('appName')}
            </Title>
          </LeftSection>
          {(!isTablet && !isMobile) && (
            <DesktopMenu>
               <Tooltip 
                title={currentTeam ? "" : t('mustJoinTeam')}
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
      <ResponsiveDialog open={openTeamsDialog} onClose={handleCloseTeams} maxWidth="sm">
        <DefaultDialogContent isMobile={isMobile}>
          <Teams user={user} />
        </DefaultDialogContent>
        <DefaultDialogActions>
          <Button onClick={handleCloseTeams}>{t('close')}</Button>
        </DefaultDialogActions>
      </ResponsiveDialog>

      {/* CreateTeam dialog */}
      <ResponsiveDialog open={openCreateDialog} onClose={handleCloseCreate} maxWidth="sm">
        <DefaultDialogContent isMobile={isMobile}>
          <CreateTeam user={user} currentTeam={currentTeam} setCurrentTeam={setCurrentTeam} />
        </DefaultDialogContent>
        <DefaultDialogActions>
          <Button onClick={handleCloseCreate}>{t('close')}</Button>
        </DefaultDialogActions>
      </ResponsiveDialog>

      {/* Notifications dialog */}
      <ResponsiveDialog open={openNotificationsDialog} onClose={handleCloseNotifications} maxWidth="sm">
        <DefaultDialogContent isMobile={isMobile}>
          <Notifications user={user} />
        </DefaultDialogContent>
        <DefaultDialogActions>
          <Button onClick={handleCloseNotifications}>{t('close')}</Button>
        </DefaultDialogActions>
      </ResponsiveDialog>

      {/* Settings modal */}
      <ResponsiveDialog open={openSettingsModal} onClose={handleCloseSettings} maxWidth="sm">
        <SettingsDialogContent>
          <UserSettings user={user} setUser={setUser} isModal onClose={handleCloseSettings} />
        </SettingsDialogContent>
      </ResponsiveDialog>

      {/* Statistics dialog */}
      <ResponsiveDialog open={openStatisticsDialog} onClose={handleCloseStatistics} maxWidth="xl">
        <StatsDialogContent isMobile={isMobile}>
          <Statistics user={user} teamId={currentTeam?.id} />
        </StatsDialogContent>
        <StatsDialogActions>
          <Button onClick={handleCloseStatistics}>{t('close')}</Button>
        </StatsDialogActions>
      </ResponsiveDialog>
    </Root>
  );
}

export default Dashboard;