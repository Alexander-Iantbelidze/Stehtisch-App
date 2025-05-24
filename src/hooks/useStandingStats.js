import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Custom hook to manage and fetch standing statistics for a user
export default function useStandingStats(userId) {
  const [dailyStandingTime, setDailyStandingTime] = useState(0);
  const [averageStandingTime, setAverageStandingTime] = useState(0);
  const [longestSessionTime, setLongestSessionTime] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      const q = query(
        collection(db, 'standingTimes'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);

      let total = 0;
      let dailyTotal = 0;
      let sessionCount = 0;
      let longestSession = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const duration = data.duration;
        const timestamp = data.startTime.toDate();

        total += duration;
        sessionCount += 1;
        if (duration > longestSession) {
          longestSession = duration;
        }
        if (timestamp >= today) {
          dailyTotal += duration;
        }
      });

      const avgTime = sessionCount > 0 ? total / sessionCount : 0;
      setDailyStandingTime(dailyTotal);
      setAverageStandingTime(avgTime);
      setLongestSessionTime(longestSession);
    } catch (error) {
      console.error('Error fetching standing stats:', error);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { dailyStandingTime, averageStandingTime, longestSessionTime, fetchStats };
}
