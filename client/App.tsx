import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ContentManager from './pages/ContentManager';
import UserManager from './pages/UserManager';
import Marketing from './pages/Marketing';
import EventsManager from './pages/EventsManager';
import Settings from './pages/Settings';
import Articles from './pages/Articles';
import Jobs from './pages/Jobs';

const App: React.FC = () => {
  // In a real app, this would be managed by Context/Redux and persistence
  // Check localStorage on mount to persist login
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('authToken');
  });
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);
  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="min-h-screen font-sans selection:bg-blue-500/30 transition-colors duration-300">
        {isAuthenticated ? (
          <div className="flex">
            <Sidebar onLogout={handleLogout} toggleTheme={toggleTheme} isDark={isDark} />
            {/* Removed z-0 to allow fixed children (modals) to stack above sidebar */}
            <main className="flex-1 ml-64 p-8 min-h-screen bg-slate-50/50 dark:bg-slate-900 transition-colors duration-300 relative">
              <div className="max-w-7xl mx-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/articles" element={<Articles />} />
                  <Route path="/content" element={<ContentManager />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/users" element={<UserManager />} />
                  <Route path="/marketing" element={<Marketing />} />
                  <Route path="/events" element={<EventsManager />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </main>
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
};

export default App;