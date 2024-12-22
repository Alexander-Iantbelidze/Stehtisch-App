import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Teams from './components/Teams';
import CreateTeam from './components/CreateTeam';
import Notifications from './components/Notifications';
import Statistics from './components/Statistics';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';

function App() {
  const [user, setUser] = useState(null);
  const [currentTeam, setCurrentTeam] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const username = userDoc.exists() ? userDoc.data().username : 'Unbekannter Benutzer';

        setUser({
          uid: user.uid,
          email: user.email,
          username: username,
        });

        // Fetch Current Team
        try {
          // Teams, die vom Benutzer erstellt wurden
          const createdTeamsQuery = query(
            collection(db, 'teams'),
            where('adminId', '==', user.uid)
          );
          const createdTeamsSnapshot = await getDocs(createdTeamsQuery);
          
          if (!createdTeamsSnapshot.empty) {
            const team = createdTeamsSnapshot.docs[0].data();
            setCurrentTeam({ id: createdTeamsSnapshot.docs[0].id, ...team });
            return;
          }
          
          // Teams, denen der Benutzer beigetreten ist
          const joinedTeamsQuery = query(
            collection(db, 'teams'),
            where('members', 'array-contains', user.uid)
          );
          const joinedTeamsSnapshot = await getDocs(joinedTeamsQuery);
          
          if (!joinedTeamsSnapshot.empty) {
            const team = joinedTeamsSnapshot.docs[0].data();
            setCurrentTeam({ id: joinedTeamsSnapshot.docs[0].id, ...team });
            return;
          }
          
          // Wenn der Benutzer in keinem Team ist
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

  return (
    <Router>
      <div className="App">
        {user ? (
          <Routes>
            <Route path="/" element={<Dashboard user={user} currentTeam={currentTeam} />} />
            <Route path="/teams" element={<Teams user={user} />} />
          <Route path="/create-team" element={<CreateTeam user={user} currentTeam={currentTeam} setCurrentTeam={setCurrentTeam} />} />
            <Route path="/notifications" element={<Notifications user={user} />} />
            <Route path="/statistics" element={<Statistics user={user} teamId={currentTeam ? currentTeam.id : null} />} />
          </Routes>
        ) : (
          <Login />
        )}
      </div>
    </Router>
  );
}

export default App;