
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import { Overview } from './pages/Overview';
import { CreatorStudio } from './pages/CreatorStudio';
import { BotManager } from './pages/BotManager';
import { Calendar } from './pages/Calendar';
import { MediaLibrary } from './pages/MediaLibrary';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Campaigns } from './pages/Campaigns';
import { Integrations } from './pages/Integrations';
import { UserManagement } from './pages/UserManagement';
import { BotActivityLog } from './pages/BotActivityLog';
import { Login } from './pages/Login';
import { isAuthenticated } from './lib/mockAuth';
import { BotType } from './types';

const App: React.FC = () => {
  const [isAuth, setIsAuth] = useState(isAuthenticated());
  const [navParams, setNavParams] = useState<any>(undefined);

  const handleNavigate = (page: string, params?: any) => {
    // In a real router, we'd use useNavigate() hook here, 
    // but preserving the prop drill interface for now to match component expectations
    setNavParams(params);
  };

  const handleLoginSuccess = () => {
    setIsAuth(true);
  };

  if (!isAuth) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="creator" element={<CreatorStudio onNavigate={handleNavigate} params={navParams} />} />
        <Route path="calendar" element={<Calendar onNavigate={handleNavigate} params={navParams} />} />
        <Route path="bots" element={<BotManager onNavigate={handleNavigate} />} />
        <Route path="bot-activity" element={<BotActivityLog botType={navParams?.botType || BotType.Creator} onBack={() => {}} />} />
        <Route path="media" element={<MediaLibrary />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="integrations" element={<Integrations />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default App;
