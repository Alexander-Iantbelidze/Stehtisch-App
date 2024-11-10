import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Statistics from './components/Statistics';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="App">
        {user ? (
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
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
