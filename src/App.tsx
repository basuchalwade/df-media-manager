
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import Overview from './pages/Overview';
import CreatorStudio from './pages/CreatorStudio';
import Calendar from './pages/Calendar';
import BotManager from './pages/BotManager';
import MediaLibrary from './pages/MediaLibrary';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="creator" element={<CreatorStudio />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="bots" element={<BotManager />} />
        <Route path="media" element={<MediaLibrary />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default App;
