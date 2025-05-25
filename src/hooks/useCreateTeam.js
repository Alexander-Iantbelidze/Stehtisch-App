import { useState } from 'react';
import { addDoc, collection, query, where, getDocs} from 'firebase/firestore';
import { db } from '../firebase';
import { leaveOldTeam } from '../utils/teamUtils';
import useSnackbar from './useSnackbar';

/**
 * Hook to manage team creation and optional switching from an existing team.
 */
function useCreateTeam(user, currentTeam, setCurrentTeam) {
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [openSwitchDialog, setOpenSwitchDialog] = useState(false);
  const { openSnackbar, snackbarMessage, snackbarSeverity, showAlert, closeSnackbar } = useSnackbar();

  const createTeamHelper = async () => {
    return await addDoc(collection(db, 'teams'), {
      name: teamName.trim(),
      adminId: user.uid,
      members: [user.uid],
      createdAt: new Date(),
    });
  };

  const handleCreate = async () => {
    if (!teamName.trim()) {
      showAlert('Bitte geben Sie einen Teamnamen ein.', 'warning');
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      const q = query(collection(db, 'teams'), where('name', '==', teamName.trim()));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        showAlert('Teamname bereits vergeben.', 'warning');
        return;
      }

      if (currentTeam) {
        setOpenSwitchDialog(true);
        return;
      }

      const docRef = await createTeamHelper();
      setCurrentTeam({ id: docRef.id, name: teamName.trim(), adminId: user.uid, members: [user.uid], createdAt: new Date() });
      showAlert('Team erfolgreich erstellt.', 'success');
      setTeamName('');
    } catch (error) {
      showAlert('Fehler beim Erstellen des Teams.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmSwitchTeam = async () => {
    try {
      setLoading(true);
      await leaveOldTeam(user.uid, currentTeam);
      setCurrentTeam(null);
      const docRef = await createTeamHelper();
      setCurrentTeam({ id: docRef.id, name: teamName.trim(), adminId: user.uid, members: [user.uid], createdAt: new Date() });
      showAlert('Team erfolgreich erstellt.', 'success');
      setTeamName('');
    } catch (error) {
      showAlert('Fehler beim Erstellen oder Wechseln des Teams.', 'error');
    } finally {
      setLoading(false);
      setOpenSwitchDialog(false);
    }
  };

  return { teamName, setTeamName, loading, openSwitchDialog, setOpenSwitchDialog, handleCreate, confirmSwitchTeam, openSnackbar, snackbarMessage, snackbarSeverity, closeSnackbar };
}

export default useCreateTeam;
