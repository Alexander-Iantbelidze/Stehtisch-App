import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// Custom hook to manage and fetch standing statistics for a user
export default function useStandingStats(userId) {
  const [dailyStandingTime, setDailyStandingTime] = useState(0);
  const [averageStandingTime, setAverageStandingTime] = useState(0);
  const [longestSessionTime, setLongestSessionTime] = useState(0);

  // Subscribe to standingTimes collection for real-time updates
  useEffect(() => {
    const q = query(
      collection(db, 'standingTimes'),
      where('userId', '==', userId)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let total = 0;
      let dailyTotal = 0;
      let sessionCount = 0;
      let longestSession = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      querySnapshot.forEach((doc) => {
        const { duration, startTime } = doc.data();
        const timestamp = startTime.toDate();
        total += duration;
        sessionCount += 1;
        if (duration > longestSession) longestSession = duration;
        if (timestamp >= today) dailyTotal += duration;
      });

      setDailyStandingTime(dailyTotal);
      setAverageStandingTime(sessionCount > 0 ? total / sessionCount : 0);
      setLongestSessionTime(longestSession);
    }, (error) => {
      console.error('Error syncing standing stats:', error);
    });
    return () => unsubscribe();
  }, [userId]);

  return { dailyStandingTime, averageStandingTime, longestSessionTime };
}
