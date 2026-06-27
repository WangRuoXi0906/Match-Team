import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import SplashScreen from './pages/SplashScreen';
import Login from './pages/Login';
import Register from './pages/Register';
import Competitions from './pages/Competitions';
import CompetitionDetail from './pages/CompetitionDetail';
import Recruitments from './pages/Recruitments';
import Teams from './pages/Teams';
import Profile from './pages/Profile';
import TabBar from './components/TabBar';

function AppContent() {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const isAuthPage = location.pathname.includes('/login') || location.pathname.includes('/register');

  if (!token) {
    if (location.pathname === '/') {
      return <SplashScreen />;
    }
    if (!isAuthPage) {
      return <Login />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Competitions />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/competitions/:id" element={<CompetitionDetail />} />
        <Route path="/recruitments" element={<Recruitments />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      {!isAuthPage && token && !location.pathname.includes('/competitions/') && <TabBar />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
