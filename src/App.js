// src/App.js
import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Teams from './components/Teams';
import CreateTeam from './components/CreateTeam';
import Notifications from './components/Notifications';
import Statistics from './components/Statistics';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';

function App() {
  const [user, setUser] = useState(null);

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
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="App">
        {user ? (
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/teams" element={<Teams user={user} />} />
            <Route path="/create-team" element={<CreateTeam user={user} />} />
            <Route path="/notifications" element={<Notifications user={user} />} />
            <Route path="/statistics" element={<Statistics user={user} />} />
          </Routes>
        ) : (
          <Login />
        )}
      </div>
    </Router>
  );
}

export default App;