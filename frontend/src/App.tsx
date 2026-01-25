
import React from 'react';
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

const App: React.FC = () => {
  const [isAuth, setIsAuth] = React.useState(isAuthenticated());

  if (!isAuth) {
    return <Login onLoginSuccess={() => setIsAuth(true)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="creator" element={<CreatorStudio onNavigate={() => {}} />} />
        <Route path="calendar" element={<Calendar onNavigate={() => {}} />} />
        <Route path="bots" element={<BotManager onNavigate={() => {}} />} />
        <Route path="bot-activity" element={<BotActivityLog botType="Creator Bot" onBack={() => {}} />} />
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
