import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import useSnackbar from './useSnackbar';

/**
 * Hook to manage team search, join requests, and joining a team.
 * @param {string} search - Current search term for team names.
 * @param {object} user - Current user object with uid and username.
 * @returns {object} - teams list, joinRequestsMap, handleJoin function.
 */
function useTeams(search, user) {
  const [teams, setTeams] = useState([]);
  const [joinRequestsMap, setJoinRequestsMap] = useState({});
  const { showAlert } = useSnackbar();

  useEffect(() => {
    async function fetchJoinRequests() {
      const q = query(collection(db, 'joinRequests'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const tempMap = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        tempMap[data.teamId] = data.status;
      });
      setJoinRequestsMap(tempMap);
    }
    fetchJoinRequests();
  }, [user.uid]);

  useEffect(() => {
    async function fetchTeams() {
      const q = query(
        collection(db, 'teams'),
        where('name', '>=', search),
        where('name', '<=', search + '\uf8ff')
      );
      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach((docSnap) => {
        if (docSnap.id !== user.uid) {
          list.push({ id: docSnap.id, ...docSnap.data() });
        }
      });
      setTeams(list);
    }
    if (search) fetchTeams();
    else setTeams([]);
  }, [search, user.uid]);

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
        message: `${user.username} möchte Ihrem Team beitreten.`,
        read: false,
        joinRequestId: joinReqRef.id,
        teamId,
        createdAt: new Date(),
      });
      setJoinRequestsMap((prev) => ({ ...prev, [teamId]: 'pending' }));
      showAlert('Beitrittsanfrage gesendet!', 'info');
    } catch (error) {
      showAlert('Fehler beim Senden der Beitrittsanfrage. Bitte versuchen Sie es erneut.', 'error');
    }
  };

  return { teams, joinRequestsMap, handleJoin };
}

export default useTeams;
