
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import Overview from './pages/Overview';
import CreatorStudio from './pages/CreatorStudio';
import BotManager from './pages/BotManager';
import Calendar from './pages/Calendar';
import MediaLibrary from './pages/MediaLibrary';
import Analytics from './pages/Analytics';
import Integrations from './pages/Integrations';
import Team from './pages/Team';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Campaigns from './pages/Campaigns';

function App() {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="creator" element={<CreatorStudio />} />
        <Route path="bots" element={<BotManager />} />
        <Route path="media" element={<MediaLibrary />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="integrations" element={<Integrations />} />
        <Route path="users" element={<Team />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
