import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, TextField, List, ListItem, Button, Typography, Tooltip } from '@mui/material';
import useAuth from '../hooks/useAuth';
import useSnackbar from '../hooks/useSnackbar';
import useTeams from '../hooks/useTeams';
import SnackbarAlert from './SnackbarAlert';

const Teams = ({ user }) => {
  const { t } = useTranslation();
  const { currentTeam } = useAuth();
  const [search, setSearch] = React.useState('');
  const { openSnackbar, snackbarMessage, snackbarSeverity, closeSnackbar } = useSnackbar();
  const { teams, joinRequestsMap, handleJoin } = useTeams(search, user);

  return (
    <Box>
      <Typography variant="h4">{t('teamsHeader')}</Typography>
      <TextField
        label={t('searchTeam')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        margin="normal"
      />
      <List>
        {teams.map((team) => {
          const requestStatus = joinRequestsMap[team.id];
          const isCurrentTeam = currentTeam && currentTeam.id === team.id;
          
          const disabledButton = isCurrentTeam || requestStatus === 'pending';

          return (
            <ListItem key={team.id} divider>
              <Tooltip title={team.name}>
                <Typography
                  noWrap
                  sx={{
                    maxWidth: 150,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {team.name}
                </Typography>
              </Tooltip>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleJoin(team.id)}
                disabled={disabledButton}
                sx={{ ml: 'auto' }}
              >
                {isCurrentTeam 
                  ? t('currentTeam') 
                  : requestStatus === 'pending' 
                    ? t('pendingRequest')
                    : t('joinTeamBtn')
                }
              </Button>
            </ListItem>
          );
        })}
      </List>
      <SnackbarAlert
        open={openSnackbar}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={closeSnackbar}
      />
    </Box>
  );
};

export default Teams;