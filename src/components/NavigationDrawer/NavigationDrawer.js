import { MenuList, DrawerContainer } from './NavigationDrawer.styles';
import { ListItemButton, ListItemIcon, ListItemText, Badge } from '@mui/material';
import { BarChart as StatisticsIcon, GroupAdd as JoinTeamIcon, AddCircle as CreateTeamIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

/**
 * Sidebar navigation drawer with menu items.
 * Props:
 * - currentTeam: object or null
 * - unreadCount: number
 * - onMenuClick: function(action: string)
 */
function NavigationDrawer({ currentTeam, unreadCount, onMenuClick }) {
  const { t } = useTranslation();
  const isAdmin = currentTeam?.adminId === undefined ? false : true;

  return (
    <DrawerContainer role="presentation">
      <MenuList>
        <ListItemButton onClick={() => onMenuClick('statistics')} disabled={!currentTeam}>
          <ListItemIcon>
            <StatisticsIcon color={currentTeam ? 'primary' : 'disabled'} />
          </ListItemIcon>
          <ListItemText primary={t('teamStatistics')} />
        </ListItemButton>

        <ListItemButton onClick={() => onMenuClick('joinTeam')}>
          <ListItemIcon>
            <JoinTeamIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary={t('joinTeam')} />
        </ListItemButton>

        <ListItemButton onClick={() => onMenuClick('createTeam')}>
          <ListItemIcon>
            <CreateTeamIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary={t('createTeam')} />
        </ListItemButton>

        {isAdmin && (
          <ListItemButton onClick={() => onMenuClick('notifications')}>
            <ListItemIcon>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon color="primary" />
              </Badge>
            </ListItemIcon>
            <ListItemText primary={t('myNotifications')} />
          </ListItemButton>
        )}
      </MenuList>
    </DrawerContainer>
  );
}

export default NavigationDrawer;
