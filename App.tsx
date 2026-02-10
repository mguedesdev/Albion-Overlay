
import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import OverlayPage from './pages/OverlayPage';
import { AppProvider } from './context/AppContext';

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/admin');
    }
  }, [location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/overlay" element={<OverlayPage />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
};

export default App;
