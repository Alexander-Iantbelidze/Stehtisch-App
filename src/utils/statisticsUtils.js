import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Return the start date for a given period
export function getStartDate(period) {
  const now = new Date();
  switch (period) {
    case 'daily':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'weekly': {
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(now.getDate() - now.getDay());
      return firstDayOfWeek;
    }
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'yearly':
      return new Date(now.getFullYear(), 0, 1);
    default:
      return new Date(0);
  }
}

// Generic ranking creator for a metric
export function getRanking(userStats, metric) {
  return Object.entries(userStats)
    .map(([userId, stats]) => ({
      userId,
      value: stats[metric],
      sessionCount: stats.sessionCount,
    }))
    .sort((a, b) => b.value - a.value);
}

// Fetch usernames for a list of user IDs, batching in groups of 10
export async function fetchUsernames(userIds) {
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
    snapshot.forEach(docSnap => {
      usernamesMap[docSnap.id] = docSnap.data().username || 'Unknown User';
    });
  });

  return usernamesMap;
}

// Format a duration (in seconds) to a human-readable string
export function formatTime(timeInSeconds) {
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
}
