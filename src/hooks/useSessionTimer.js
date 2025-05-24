import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';

// Custom hook to manage the standing session timer and record sessions in Firestore
export default function useSessionTimer(userId, onStop) {
  const [isStanding, setIsStanding] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [currentSessionTime, setCurrentSessionTime] = useState(0);

  useEffect(() => {
    let interval;
    if (isStanding && startTime !== null) {
      interval = setInterval(() => {
        setCurrentSessionTime(
          Math.floor((Date.now() - startTime) / 1000)
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStanding, startTime]);

  const toggleStanding = useCallback(async () => {
    if (isStanding) {
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);
      // Record session in Firestore
      await addDoc(collection(db, 'standingTimes'), {
        userId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration,
      });
      setIsStanding(false);
      setStartTime(null);
      setCurrentSessionTime(0);
      if (onStop) onStop();
    } else {
      setIsStanding(true);
      setStartTime(Date.now());
    }
  }, [isStanding, startTime, userId, onStop]);

  return { isStanding, currentSessionTime, toggleStanding };
}
