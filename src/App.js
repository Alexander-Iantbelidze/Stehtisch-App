import Login from './components/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Teams from './components/Teams';
import CreateTeam from './components/CreateTeam';
import Notifications from './components/Notifications/Notifications';
import Statistics from './components/Statistics';
import UserSettings from './components/UserSettings';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import useAuth from './hooks/useAuth';

function App() {
  const { user, currentTeam, setUser, setCurrentTeam } = useAuth();

  return (
    <Router>
      <div className="App">
        {user ? (
          <Routes>
            <Route path="/" element={<Dashboard user={user} setUser={setUser} currentTeam={currentTeam} />} />
            <Route path="/teams" element={<Teams user={user} />} />
            <Route path="/create-team" element={<CreateTeam user={user} currentTeam={currentTeam} setCurrentTeam={setCurrentTeam} />} />
            <Route path="/notifications" element={<Notifications user={user} />} />
            <Route path="/statistics" element={<Statistics user={user} teamId={currentTeam ? currentTeam.id : null} />} />
            <Route path="/settings" element={<UserSettings user={user} setUser={setUser} />} />
          </Routes>
        ) : (
          <Login />
        )}
      </div>
    </Router>
  );
}

export default App;