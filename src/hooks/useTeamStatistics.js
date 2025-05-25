import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getStartDate, getRanking, fetchUsernames } from '../utils/statisticsUtils';

/**
 * Hook to fetch and prepare team statistics for a given team and period.
 * @param {string} teamId - ID of the team to fetch stats for.
 * @param {string} initialPeriod - Initial period ('daily', 'weekly', 'monthly', 'yearly').
 * @returns {object} - { period, setPeriod, teamName, rows, loading }
 */
function useTeamStatistics(teamId, initialPeriod = 'daily') {
  const [period, setPeriod] = useState(initialPeriod);
  const [teamName, setTeamName] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeamName() {
      if (!teamId) return;
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      if (teamDoc.exists()) setTeamName(teamDoc.data().name);
    }
    fetchTeamName();
  }, [teamId]);

  useEffect(() => {
    async function fetchStats() {
      if (!teamId) { setLoading(false); return; }
      setLoading(true);
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      const memberIds = teamDoc.exists() ? teamDoc.data().members || [] : [];
      if (memberIds.length === 0) { setRows([]); setLoading(false); return; }
      const startDate = getStartDate(period);
      const timesSnapshot = await getDocs(
        query(collection(db, 'standingTimes'), where('userId', 'in', memberIds))
      );
      // aggregate
      const userStats = {};
      timesSnapshot.forEach(snap => {
        const { userId, duration, startTime } = snap.data();
        const ts = startTime.toDate();
        if (ts < startDate) return;
        if (!userStats[userId]) userStats[userId] = { totalStandingTime: 0, sessionCount: 0, longestSessionTime: 0 };
        userStats[userId].totalStandingTime += duration;
        userStats[userId].sessionCount += 1;
        userStats[userId].longestSessionTime = Math.max(userStats[userId].longestSessionTime, duration);
      });
      // average
      Object.values(userStats).forEach(stats => {
        stats.averageSessionTime = stats.sessionCount > 0
          ? stats.totalStandingTime / stats.sessionCount
          : 0;
      });
      // rankings
      const totalRanking = getRanking(userStats, 'totalStandingTime');
      const averageRanking = getRanking(userStats, 'averageSessionTime');
      const longestRanking = getRanking(userStats, 'longestSessionTime');
      const usernamesMap = await fetchUsernames(Object.keys(userStats));
      // build rows
      const newRows = totalRanking.map((item, idx) => {
        const userId = item.userId;
        const avg = averageRanking.find(r => r.userId === userId);
        const longest = longestRanking.find(r => r.userId === userId);
        return {
          id: userId,
          rank: idx + 1,
          username: usernamesMap[userId] || userId,
          totalTime: item.value,
          avgTime: avg ? avg.value : 0,
          longestSession: longest ? longest.value : 0,
          sessions: item.sessionCount || 0,
        };
      });
      setRows(newRows);
      setLoading(false);
    }
    fetchStats();
  }, [teamId, period]);

  return { period, setPeriod, teamName, rows, loading };
}

export default useTeamStatistics;
