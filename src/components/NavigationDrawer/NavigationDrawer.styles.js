import { styled } from '@mui/material/styles';
import { Box, List } from '@mui/material';

// Container for the drawer
export const DrawerContainer = styled(Box)(({ theme }) => ({
  width: 250,
}));

// Styled list with formatting for menu items
export const MenuList = styled(List)(({ theme }) => ({
  padding: 0,
  '& .MuiListItemButton-root': {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  '& .MuiListItemIcon-root': {
    minWidth: 0,
    marginRight: theme.spacing(2),
  },
  '& .MuiListItemText-root': {
    marginRight: theme.spacing(2),
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  },
}));
