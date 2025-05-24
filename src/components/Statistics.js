import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getStartDate, getRanking, fetchUsernames, formatTime } from '../utils/statisticsUtils';
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
      if (!teamId) return setLoading(false);
      setLoading(true);
      try {
        const teamDocRef = doc(db, 'teams', teamId);
        const teamDoc = await getDoc(teamDocRef);
        const memberIds = teamDoc.exists() ? teamDoc.data().members || [] : [];
        if (!memberIds.length) return setLoading(false);

        // Fetch standingTimes
        const timesSnapshot = await getDocs(query(
          collection(db, 'standingTimes'), where('userId', 'in', memberIds)
        ));

        // Aggregate stats
        const userStats = {};
        const startDate = getStartDate(period);
        timesSnapshot.forEach(snap => {
          const { userId, duration, startTime } = snap.data();
          const ts = startTime.toDate();
          if (ts < startDate) return;
          if (!userStats[userId]) userStats[userId] = { totalStandingTime:0, sessionCount:0, longestSessionTime:0 };
          userStats[userId].totalStandingTime += duration;
          userStats[userId].sessionCount += 1;
          userStats[userId].longestSessionTime =
            Math.max(userStats[userId].longestSessionTime, duration);
        });

        // Calculate average session time
        Object.values(userStats).forEach(stats => {
          stats.averageSessionTime = stats.sessionCount > 0
            ? stats.totalStandingTime / stats.sessionCount
            : 0;
        });

        // Compute derived rankings and usernames
        setRankings({
          totalStandingTimeRanking: getRanking(userStats,'totalStandingTime'),
          averageSessionTimeRanking: getRanking(userStats,'averageSessionTime'),
          longestSessionTimeRanking: getRanking(userStats,'longestSessionTime')
        });
        setUsernames(await fetchUsernames(memberIds));
      } catch (e) {
        console.error('Error fetching statistics:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStatistics();
  }, [period, teamId]);

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