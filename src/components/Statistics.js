// Statistics.js
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
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

function Statistics({ user }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchStatistics = async () => {
      const q = query(
        collection(db, 'standingTimes'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const statsData = [];
      querySnapshot.forEach((doc) => {
        // Process data for the chart
        const { duration, startTime } = doc.data();
        statsData.push({ date: startTime.toDate(), standingTime: duration });
      });
      setData(statsData);
    };
    fetchStatistics();
  }, [user.uid]);

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        Your Statistics
      </Typography>
      <LineChart width={800} height={400} data={data}>
        <XAxis dataKey="date" />
        <YAxis
          label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <Line
          type="monotone"
          dataKey="standingTime"
          stroke="#8884d8"
          strokeWidth={2}
        />
      </LineChart>
      {/* Add more charts or statistics as needed */}
    </Container>
  );
}

export default Statistics;