import { useEffect } from 'react';
import useStandingStats from './useStandingStats';
import { formatTime } from '../utils/statisticsUtils';

/**
 * Hook that provides formatted standing statistics and refresh functionality.
 * @param {string} userId - User ID for which to fetch stats.
 * @returns {object} - { formattedDailyTime, formattedAverageTime, formattedLongestTime, fetchStats }
 */
function useStatsOverview(userId) {
  const { dailyStandingTime, averageStandingTime, longestSessionTime, fetchStats } = useStandingStats(userId);

  // Refresh stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formattedDailyTime = formatTime(dailyStandingTime);
  const formattedAverageTime = formatTime(averageStandingTime);
  const formattedLongestTime = formatTime(longestSessionTime);

  return { formattedDailyTime, formattedAverageTime, formattedLongestTime, fetchStats };
}

export default useStatsOverview;
