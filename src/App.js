import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="App">
      {user ? <Dashboard user={user} /> : <Login />}
    </div>
  );
}

export default App;
