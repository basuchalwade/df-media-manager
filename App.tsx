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

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('overview');
  const [navParams, setNavParams] = useState<any>(undefined);

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page);
    setNavParams(params);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'overview': return <Overview />;
      case 'creator': return <CreatorStudio onNavigate={handleNavigate} params={navParams} />;
      case 'calendar': return <Calendar onNavigate={handleNavigate} />;
      case 'analytics': return <Analytics />;
      case 'bots': return <BotManager />;
      case 'users': return <UserManagement />;
      case 'integrations': return <Integrations />;
      case 'media': return <MediaLibrary />;
      case 'settings': return <Settings />;
      default: return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
             <h2 className="text-xl font-bold mb-2 tracking-tight">Coming Soon</h2>
             <p>The {currentPage} module is under development.</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#F5F5F7] overflow-hidden text-[#1d1d1f]">
      {/* Sidebar - macOS Style */}
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      
      {/* Main Content Area - Card-like container on larger screens */}
      <main className="flex-1 h-full overflow-hidden relative">
        <div className="h-full overflow-y-auto custom-scrollbar p-6 lg:p-10 scroll-smooth">
          <div className="max-w-[1400px] mx-auto min-h-full pb-20">
            {renderPage()}
          </div>
        </div>
      </main>

      {/* Status Pill - Floating iOS Style */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-transform hover:scale-105 cursor-default">
           <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] animate-pulse"></div>
           <span className="text-[11px] font-semibold tracking-wide text-gray-600 uppercase">Demo Environment</span>
        </div>
      </div>
    </div>
  );
};

export default App;
