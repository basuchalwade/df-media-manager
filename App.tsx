import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Overview } from './pages/Overview';
import { CreatorStudio } from './pages/CreatorStudio';
import { BotManager } from './pages/BotManager';
import { Settings } from './pages/Settings';
import { Calendar } from './pages/Calendar';
import { Analytics } from './pages/Analytics';
import { UserManagement } from './pages/UserManagement';
import { Integrations } from './pages/Integrations';
import { MediaLibrary } from './pages/MediaLibrary';

// Simple Router implementation since we're using hash-based navigation for simplicity in this output
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('overview');

  const renderPage = () => {
    switch (currentPage) {
      case 'overview': return <Overview />;
      case 'creator': return <CreatorStudio />;
      case 'calendar': return <Calendar />;
      case 'analytics': return <Analytics />;
      case 'bots': return <BotManager />;
      case 'users': return <UserManagement />;
      case 'integrations': return <Integrations />;
      case 'media': return <MediaLibrary />;
      case 'settings': return <Settings />;
      default: return (
        <div className="flex items-center justify-center h-full text-slate-400">
          <div className="text-center">
             <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
             <p>The {currentPage} module is under development.</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto h-full">
          {renderPage()}
        </div>
      </main>

      {/* Backend Connection Indicator */}
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 shadow-sm flex items-center gap-2">
         <div className="w-2 h-2 rounded-full bg-orange-400"></div>
         Demo Mode (Mock Backend)
      </div>
    </div>
  );
};

export default App;
