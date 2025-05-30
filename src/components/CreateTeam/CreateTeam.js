import { Typography, TextField, Dialog, DialogTitle } from '@mui/material';
import useCreateTeam from '../../hooks/useCreateTeam';
import SnackbarAlert from '../SnackbarAlert';
import {
  Container,
  StyledButton
} from './CreateTeam.styles';
import { useTranslation } from 'react-i18next';

const CreateTeam = ({ user, currentTeam, setCurrentTeam }) => {
  const { t } = useTranslation();
  const {
    teamName,
    setTeamName,
    loading,
    openSwitchDialog,
    setOpenSwitchDialog,
    handleCreate,
    confirmSwitchTeam,
    openSnackbar,
    snackbarMessage,
    snackbarSeverity,
    closeSnackbar
  } = useCreateTeam(user, currentTeam, setCurrentTeam);

  return (
    <>  
      <Container>
        <Typography variant="h4">{t('createNewTeam')}</Typography>
        <TextField
          label={t('teamNameLabel')}
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <StyledButton
          variant="contained"
          color="primary"
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? t('creatingTeam') : t('createTeam')}
        </StyledButton>
      </Container>

      <Dialog open={openSwitchDialog} onClose={() => setOpenSwitchDialog(false)}>
        <DialogTitle>{t('switchTeamTitle')}</DialogTitle>
          <Typography>{t('switchTeamMessage', { currentTeam: currentTeam?.name })}</Typography>
          <StyledButton onClick={() => setOpenSwitchDialog(false)}>{t('cancel')}</StyledButton>
          <StyledButton onClick={confirmSwitchTeam} autoFocus>{t('confirm')}</StyledButton>
      </Dialog>
      <SnackbarAlert
        open={openSnackbar}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={closeSnackbar}
      />
    </>
  );
};

export default CreateTeam;
