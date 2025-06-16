import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, doc, getDoc } from 'firebase/firestore';
import useSnackbar from './useSnackbar';

/**
 * Hook to manage team search, join requests, and joining a team.
 * @param {string} search - Current search term for team names.
 * @param {object} user - Current user object with uid and username.
 * @returns {object} - teams list, joinRequestsMap, handleJoin function.
 */
function useTeams(search, user) {
  const { t } = useTranslation();
  const [teams, setTeams] = useState([]);
  const [joinRequestsMap, setJoinRequestsMap] = useState({});
  const { showAlert } = useSnackbar();

  // Debounce search term to avoid firing a query on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Subscribe to user's join requests for real-time updates
  useEffect(() => {
    const q = query(collection(db, 'joinRequests'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tempMap = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        tempMap[data.teamId] = data.status;
      });
      setJoinRequestsMap(tempMap);
    }, (error) => console.error('Error syncing joinRequests:', error));
    return () => unsubscribe();
  }, [user.uid]);

  // Subscribe to team search results for real-time updates
  useEffect(() => {
    if (!debouncedSearch) {
      setTeams([]);
      return;
    }
    const q = query(
      collection(db, 'teams'),
      where('name', '>=', debouncedSearch),
      where('name', '<=', debouncedSearch + '\uf8ff')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((docSnap) => {
        if (docSnap.id !== user.uid) {
          list.push({ id: docSnap.id, ...docSnap.data() });
        }
      });
      setTeams(list);
    }, (error) => console.error('Error syncing teams:', error));
    return () => unsubscribe();
  }, [debouncedSearch, user.uid]);

  const handleJoin = async (teamId) => {
    try {
      const joinReqRef = await addDoc(collection(db, 'joinRequests'), {
        teamId,
        userId: user.uid,
        status: 'pending',
        requestedAt: new Date(),
      });
      const teamRef = doc(db, 'teams', teamId);
      const teamSnap = await getDoc(teamRef);
      const teamAdminId = teamSnap.data()?.adminId;
      await addDoc(collection(db, 'notifications'), {
        userId: teamAdminId,
        senderId: user.uid,
        message: t('joinRequestMessage', { username: user.username }),
        read: false,
        joinRequestId: joinReqRef.id,
        teamId,
        createdAt: new Date(),
      });
      setJoinRequestsMap((prev) => ({ ...prev, [teamId]: 'pending' }));
      showAlert(t('requestSent'), 'info');
    } catch (error) {
      showAlert(t('joinError'), 'error');
    }
  };

  return { teams, joinRequestsMap, handleJoin };
}

export default useTeams;
