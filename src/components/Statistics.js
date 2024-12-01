import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import {
  Container,
  Typography,
  Select,
  MenuItem,
} from '@mui/material';

function Statistics({ user }) {
  const [period, setPeriod] = useState('daily');
  const [rankings, setRankings] = useState({});
  const [usernames, setUsernames] = useState({});

  // Zeiträume
  const periods = ['daily', 'weekly', 'monthly', 'yearly'];

 
  useEffect(() => {
    const fetchStatistics = async () => {
      // 1. Alle standingTimes abrufen
      const q = query(collection(db, 'standingTimes'));
      const querySnapshot = await getDocs(q);

      // 2. Daten nach Zeitraum filtern und Statistiken berechnen
      const startDate = getStartDate(period);
      const userStats = {};

      querySnapshot.forEach((doc) => {
        const { userId, duration, startTime } = doc.data();
        const timestamp = startTime.toDate();

        if (timestamp >= startDate) {
          if (!userStats[userId]) {
            userStats[userId] = {
              totalStandingTime: 0,
              sessionCount: 0,
              longestSessionTime: 0,
            };
          }

          userStats[userId].totalStandingTime += duration;
          userStats[userId].sessionCount += 1;
          if (duration > userStats[userId].longestSessionTime) {
            userStats[userId].longestSessionTime = duration;
          }
        }
      });

      // Durchschnittliche Sitzungsdauer berechnen
      for (let userId in userStats) {
        const stats = userStats[userId];
        stats.averageSessionTime = stats.sessionCount > 0 ? stats.totalStandingTime / stats.sessionCount : 0;
      }

      // 3. Ranglisten erstellen (alle Benutzer)
      const totalStandingTimeRanking = getRanking(userStats, 'totalStandingTime');
      const averageSessionTimeRanking = getRanking(userStats, 'averageSessionTime');
      const longestSessionTimeRanking = getRanking(userStats, 'longestSessionTime');

      setRankings({
        totalStandingTimeRanking,
        averageSessionTimeRanking,
        longestSessionTimeRanking,
      });

      // 4. Benutzernamen abrufen
      const userIds = Object.keys(userStats);
      const usernamesMap = await fetchUsernames(userIds);
      setUsernames(usernamesMap);
    };

    fetchStatistics();
  }, [period]);

  const getStartDate = (period) => {
    const now = new Date();
    switch (period) {
      case 'daily':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'weekly':
        const firstDayOfWeek = new Date(now);
        firstDayOfWeek.setDate(now.getDate() - now.getDay());
        return new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate());
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'yearly':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(0);
    }
  };

  const getRanking = (userStats, metric) => {
    return Object.entries(userStats)
      .map(([userId, stats]) => ({
        userId,
        value: stats[metric],
      }))
      .sort((a, b) => b.value - a.value);
  };

  const fetchUsernames = async (userIds) => {
    const usernamesMap = {};

    if (userIds.length === 0) {
      return usernamesMap;
    }

    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, where('__name__', 'in', userIds));
    const usersSnapshot = await getDocs(usersQuery);
    usersSnapshot.forEach((doc) => {
      usernamesMap[doc.id] = doc.data().username || 'Unbekannter Benutzer';
    });
    return usernamesMap;
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        Team Statistics
      </Typography>

      {/* Zeitraum-Auswahl */}
      <Select value={period} onChange={(e) => setPeriod(e.target.value)} sx={{ mb: 3 }}>
        {periods.map((p) => (
          <MenuItem key={p} value={p}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </MenuItem>
        ))}
      </Select>

      {/* Ranglisten anzeigen */}
      {rankings.totalStandingTimeRanking && (
        <>
          <Typography variant="h5" sx={{ mt: 3 }}>
            Daily Standing Time
          </Typography>
          {rankings.totalStandingTimeRanking.map((item, index) => (
            <Typography key={item.userId}>
              {index + 1}. {usernames[item.userId]} - {formatTime(item.value)}
            </Typography>
          ))}

          <Typography variant="h5" sx={{ mt: 3 }}>
            Average Session Time
          </Typography>
          {rankings.averageSessionTimeRanking.map((item, index) => (
            <Typography key={item.userId}>
              {index + 1}. {usernames[item.userId] || item.userId} - {formatTime(item.value)}
            </Typography>
          ))}

          <Typography variant="h5" sx={{ mt: 3 }}>
            Longest Session Time
          </Typography>
          {rankings.longestSessionTimeRanking.map((item, index) => (
            <Typography key={item.userId}>
              {index + 1}. {usernames[item.userId] || item.userId} - {formatTime(item.value)}
            </Typography>
          ))}
        </>
      )}
    </Container>
  );
}

export default Statistics;