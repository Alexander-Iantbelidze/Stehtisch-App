import useStandingStats from './useStandingStats';
import { formatTime } from '../utils/statisticsUtils';

/**
 * Hook that provides formatted standing statistics and refresh functionality.
 * @param {string} userId - User ID for which to fetch stats.
 * @returns {object} - { formattedDailyTime, formattedAverageTime, formattedLongestTime, fetchStats }
 */
function useStatsOverview(userId) {
  const { dailyStandingTime, averageStandingTime, longestSessionTime, fetchStats } = useStandingStats(userId);
  // Note: stats are already fetched on mount by useStandingStats, so no duplicate effect here

  const formattedDailyTime = formatTime(dailyStandingTime);
  const formattedAverageTime = formatTime(averageStandingTime);
  const formattedLongestTime = formatTime(longestSessionTime);

  return { formattedDailyTime, formattedAverageTime, formattedLongestTime, fetchStats };
}

export default useStatsOverview;
