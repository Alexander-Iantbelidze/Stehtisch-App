import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';

// Custom hook to manage authentication state and current team fetching
export default function useAuth() {
  const [user, setUser] = useState(null);
  const [currentTeam, setCurrentTeam] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Retrieve user document
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const username = userDoc.exists() ? userDoc.data().username : 'Unbekannter Benutzer';

        setUser({ uid: firebaseUser.uid, email: firebaseUser.email, username });

        try {
          // Fetch teams created by the user
          const createdQuery = query(
            collection(db, 'teams'),
            where('adminId', '==', firebaseUser.uid)
          );
          const createdSnapshot = await getDocs(createdQuery);
          if (!createdSnapshot.empty) {
            const teamData = createdSnapshot.docs[0].data();
            setCurrentTeam({ id: createdSnapshot.docs[0].id, ...teamData });
            return;
          }

          // Fetch teams the user has joined
          const joinedQuery = query(
            collection(db, 'teams'),
            where('members', 'array-contains', firebaseUser.uid)
          );
          const joinedSnapshot = await getDocs(joinedQuery);
          if (!joinedSnapshot.empty) {
            const teamData = joinedSnapshot.docs[0].data();
            setCurrentTeam({ id: joinedSnapshot.docs[0].id, ...teamData });
            return;
          }

          // No team found for user
          setCurrentTeam(null);
        } catch (error) {
          console.error('Fehler beim Abrufen des Teams:', error);
          setCurrentTeam(null);
        }
      } else {
        setUser(null);
        setCurrentTeam(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, currentTeam, setUser, setCurrentTeam };
}
