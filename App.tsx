
import React, { useState, useEffect } from 'react';
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
import { BotActivityLog } from './pages/BotActivityLog';
import { Login } from './pages/Login';
import { Campaigns } from './pages/Campaigns';
import { BotType } from './types';
import { isAuthenticated } from './lib/mockAuth';
import { store } from './services/mockStore';
import { Terminal, Database, Activity, RefreshCw, X } from 'lucide-react';

// --- DEBUG COMPONENT ---
const DebugOverlay = () => {
  const [metrics, setMetrics] = useState<any>({});
  const [isOpen, setIsOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const update = async () => {
      try {
        // Direct probe of the store
        const platforms = store.getPlatforms();
        const media = await store.getMedia();
        const user = await store.getCurrentUser();
        const bots = await store.getBots();
        const settings = await store.getSettings();
        
        setMetrics({
          platformsCount: platforms.length,
          mediaItems: media.length,
          activeBots: bots.filter(b => b.enabled).length,
          user: user?.email || 'Guest',
          mode: settings.demoMode ? 'SIMULATION' : 'PRODUCTION'
        });
        setLastUpdate(new Date());
      } catch (e) {
        setMetrics({ error: 'Failed to probe store' });
      }
    };

    const interval = setInterval(update, 1000);
    update();
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[9999] bg-black text-green-400 px-3 py-2 rounded-lg font-mono text-xs border border-green-900/50 shadow-lg hover:bg-gray-900 transition-all flex items-center gap-2"
      >
        <Terminal className="w-3 h-3" />
        DEBUG
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-black/95 backdrop-blur-md text-green-400 p-4 rounded-xl font-mono text-xs w-72 border border-green-500/30 shadow-2xl animate-in slide-in-from-bottom-2">
      <div className="flex justify-between items-center mb-3 border-b border-green-900/50 pb-2">
        <div className="flex items-center gap-2">
          <Database className="w-3 h-3" />
          <span className="font-bold">System State</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-green-700 hover:text-green-400"><X className="w-3 h-3" /></button>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-500">Environment:</span>
          <span className={`font-bold ${metrics.mode === 'PRODUCTION' ? 'text-red-400' : 'text-blue-400'}`}>{metrics.mode}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Auth User:</span>
          <span className="text-white truncate max-w-[120px]">{metrics.user}</span>
        </div>
        <div className="h-px bg-white/10 my-2"></div>
        <div className="flex justify-between">
          <span className="text-gray-500">Platform Registry:</span>
          <span className="text-white">{metrics.platformsCount} connected</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Media Store:</span>
          <span className="text-white">{metrics.mediaItems} items</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Active Swarm:</span>
          <span className="text-white">{metrics.activeBots} bots</span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-green-900/50 flex justify-between text-[10px] text-gray-600">
        <span className="flex items-center gap-1">
          <Activity className="w-3 h-3" /> Live
        </span>
        <span className="flex items-center gap-1">
          {lastUpdate.toLocaleTimeString()} <RefreshCw className="w-3 h-3 animate-spin" />
        </span>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isAuth, setIsAuth] = useState(isAuthenticated());
  const [currentPage, setCurrentPage] = useState('overview');
  const [navParams, setNavParams] = useState<any>(undefined);
  const [buildTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    // Check auth on mount
    setIsAuth(isAuthenticated());
  }, []);

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page);
    setNavParams(params);
  };

  const handleLoginSuccess = () => {
    setIsAuth(true);
    setCurrentPage('overview');
  };

  // --- RENDER ---

  // Auth Guard
  if (!isAuth) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-[10000] bg-indigo-600 text-white text-center text-[10px] font-bold py-1 shadow-md uppercase tracking-wider">
          Preview Sync Active • Build: {buildTime}
        </div>
        <Login onLoginSuccess={handleLoginSuccess} />
        <DebugOverlay />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'overview': return <Overview />;
      case 'campaigns': return <Campaigns />;
      case 'creator': return <CreatorStudio onNavigate={handleNavigate} params={navParams} />;
      case 'calendar': return <Calendar onNavigate={handleNavigate} params={navParams} />;
      case 'analytics': return <Analytics />;
      case 'bots': return <BotManager onNavigate={handleNavigate} />;
      case 'bot-activity': 
          return <BotActivityLog botType={navParams?.botType || BotType.Creator} onBack={() => setCurrentPage('bots')} />;
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
    <>
      {/* VERIFICATION BANNER */}
      <div className="fixed top-0 left-0 right-0 z-[10000] bg-indigo-600 text-white text-center text-[10px] font-bold py-1 shadow-md uppercase tracking-wider pointer-events-none">
        Preview Sync Active • Build: {buildTime} • Client: React 19
      </div>

      <div className="flex h-screen w-screen bg-[#F5F5F7] overflow-hidden text-[#1d1d1f] pt-4">
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
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
          <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-transform hover:scale-105 cursor-default">
             <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></div>
             <span className="text-[11px] font-semibold tracking-wide text-gray-600 uppercase">System Active</span>
          </div>
        </div>
      </div>

      {/* DEBUG PANEL */}
      <DebugOverlay />
    </>
  );
};

export default App;
