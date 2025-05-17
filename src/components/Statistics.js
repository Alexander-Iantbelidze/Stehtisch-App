import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import {
  Container,
  Typography,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';


function Statistics({ teamId }) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('daily');
  const [rankings, setRankings] = useState({});
  const [usernames, setUsernames] = useState({});
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(true);

  const periods = ['daily', 'weekly', 'monthly', 'yearly'];

  // Column definitions for the DataGrid
  const columns = [
    { 
      field: 'rank', 
      headerName: t('rank'), 
      width: 100,
      sortable: false
    },
    { 
      field: 'username', 
      headerName: t('usernameCol'), 
      width: 200,
      sortable: false
    },
    { 
      field: 'totalTime', 
      headerName: t('totalStandingTimeCol'), 
      width: 200,
      sortable: false,
      valueFormatter: (value) => formatTime(value),
      
    },
    { 
      field: 'avgTime', 
      headerName: t('averageSessionTimeCol'), 
      width: 200,
      sortable: false,
      valueFormatter: (value) => formatTime(value),
    
    },
    { 
      field: 'longestSession', 
      headerName: t('longestSessionCol'), 
      width: 200,
      sortable: false,
      valueFormatter: (value) => formatTime(value),
   
    },
    { 
      field: 'sessions', 
      headerName: t('totalSessionsCol'), 
      width: 150,
      sortable: false,
      type: 'number'
    }
  ];

  const createRowsFromRankings = (rankings, usernames) => {
    if (!rankings.totalStandingTimeRanking) return [];

    return rankings.totalStandingTimeRanking.map((item, index) => {
      const userId = item.userId;
      const avgSession = rankings.averageSessionTimeRanking.find(r => r.userId === userId);
      const longestSession = rankings.longestSessionTimeRanking.find(r => r.userId === userId);
      
      return {
        id: userId,
        rank: index + 1,
        username: usernames[userId] || userId,
        totalTime: item.value,
        avgTime: avgSession ? avgSession.value : 0,
        longestSession: longestSession ? longestSession.value : 0,
        sessions: item.sessionCount || 0
      };
    });
  };

  useEffect(() => {
    const fetchTeamName = async () => {
      if (teamId) {
        try {
          const teamDocRef = doc(db, 'teams', teamId);
          const teamDoc = await getDoc(teamDocRef);
          if (teamDoc.exists()) {
            setTeamName(teamDoc.data().name);
          }
        } catch (error) {
          console.error('Error fetching team name:', error);
        }
      }
    };

    fetchTeamName();
  }, [teamId]);

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      if (!teamId) {
        setLoading(false);
        return;
      }

      try {
        // 1. Get team members
        const teamDocRef = doc(db, 'teams', teamId);
        const teamDoc = await getDoc(teamDocRef);
        if (!teamDoc.exists()) {
          setLoading(false);
          return;
        }

        const memberIds = teamDoc.data().members;
        if (!memberIds?.length) {
          setRankings({});
          setLoading(false);
          return;
        }

        // 2. Get all standing times
        const standingTimesQuery = query(
          collection(db, 'standingTimes'),
          where('userId', 'in', memberIds)
        );
        const standingTimesSnapshot = await getDocs(standingTimesQuery);

        // 3. Filter and calculate statistics
        const startDate = getStartDate(period);
        const userStats = {};

        standingTimesSnapshot.forEach((doc) => {
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

        // Calculate average session time
        Object.values(userStats).forEach(stats => {
          stats.averageSessionTime = stats.sessionCount > 0 
            ? stats.totalStandingTime / stats.sessionCount 
            : 0;
        });

        // Create rankings
        const rankings = {
          totalStandingTimeRanking: getRanking(userStats, 'totalStandingTime'),
          averageSessionTimeRanking: getRanking(userStats, 'averageSessionTime'),
          longestSessionTimeRanking: getRanking(userStats, 'longestSessionTime')
        };

        setRankings(rankings);

        // Get usernames
        const usernamesMap = await fetchUsernames(memberIds);
        setUsernames(usernamesMap);
        
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
      setLoading(false);
    };

    fetchStatistics();
  }, [period, teamId]);

  const getStartDate = (period) => {
    const now = new Date();
    switch (period) {
      case 'daily':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'weekly':
        const firstDayOfWeek = new Date(now);
        firstDayOfWeek.setDate(now.getDate() - now.getDay());
        return firstDayOfWeek;
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
        sessionCount: stats.sessionCount
      }))
      .sort((a, b) => b.value - a.value);
  };

  const fetchUsernames = async (userIds) => {
    const usernamesMap = {};
    const batches = [];

    for (let i = 0; i < userIds.length; i += 10) {
      const batch = userIds.slice(i, i + 10);
      const usersQuery = query(
        collection(db, 'users'),
        where('__name__', 'in', batch)
      );
      batches.push(getDocs(usersQuery));
    }

    const results = await Promise.all(batches);
    results.forEach(snapshot => {
      snapshot.forEach(doc => {
        usernamesMap[doc.id] = doc.data().username || 'Unknown User';
      });
    });

    return usernamesMap;
  };

  const formatTime = (timeInSeconds) => {
    const hrs = Math.floor(timeInSeconds / 3600);
    const mins = Math.floor((timeInSeconds % 3600) / 60);
    const secs = timeInSeconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const rows = createRowsFromRankings(rankings, usernames);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('teamStatistics')} – {teamName}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
          {periods.map((p) => (
            <MenuItem key={p} value={p}>
              {t(p)}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 25]}
          disableColumnMenu
          disableColumnFilter
          disableColumnSelector
          disableSelectionOnClick
          loading={loading}
          sx={{
            '& .MuiDataGrid-cell': {
              borderRight: '1px solid rgba(224, 224, 224, 1)',
            },
            '& .MuiDataGrid-columnHeader': {
              borderRight: '1px solid rgba(224, 224, 224, 1)',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            }
          }}
        />
      </Box>
    </Container>
  );
}

export default Statistics;