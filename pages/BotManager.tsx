
import React, { useEffect, useState } from 'react';
import { Bot, Power, Clock, Zap, Target, TrendingUp, Search, Activity, Pause, Play, ChevronRight, Settings, X, Save, Check, Shield, AlertTriangle, AlertOctagon, Hourglass, FileText, Download, Filter, Calendar, ExternalLink, BrainCircuit, Wand2, Plus, Minus } from 'lucide-react';
import { store } from '../services/mockStore';
import { BotConfig, BotType, Platform, BotSpecificConfig, BotLogEntry, LogLevel, AIStrategyConfig } from '../types';
import { PlatformIcon } from '../components/PlatformIcon';

const BOT_DESCRIPTIONS: Record<BotType, string> = {
  [BotType.Creator]: "Autonomous content engine that drafts and posts based on your topics.",
  [BotType.Engagement]: "Community manager that handles replies, likes, and interactions.",
  [BotType.Finder]: "Trend scout that monitors keywords and competitors for insights.",
  [BotType.Growth]: "Audience builder that executes safe follow/unfollow strategies."
};

interface BotManagerProps {
  onNavigate?: (page: string, params?: any) => void;
}

export const BotManager: React.FC<BotManagerProps> = ({ onNavigate }) => {
  const [bots, setBots] = useState<BotConfig[]>([]);
  const [selectedBot, setSelectedBot] = useState<BotConfig | null>(null);
  const [viewLogsBot, setViewLogsBot] = useState<BotConfig | null>(null);

  useEffect(() => {
    store.getBots().then(setBots);
  }, []);

  const handleToggle = async (type: BotType) => {
    const updated = await store.toggleBot(type);
    setBots(updated);
  };

  const handleSaveConfig = async (updatedConfig: BotConfig) => {
    const updated = await store.updateBot(updatedConfig);
    setBots(updated);
    setSelectedBot(null);
  };

  const handleViewWork = (bot: BotConfig) => {
     if (onNavigate) {
       onNavigate('calendar', { filterAuthor: bot.type });
     }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex items-end justify-between px-2">
        <div>
          <h1 className="text-[34px] font-bold text-[#1d1d1f] tracking-tight leading-tight">Bot Manager</h1>
          <p className="text-gray-500 text-lg font-medium leading-relaxed mt-1">
            Automated agents • {bots.filter(b => b.enabled).length} Active
          </p>
        </div>
        <div className="flex gap-2">
           <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-black/5 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Shield className="w-4 h-4 text-green-500" />
              Safety Engine: Active
           </div>
        </div>
      </div>

      {/* Grid Layout - Home App Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {bots.map((bot) => (
          <BotCard 
            key={bot.type} 
            bot={bot} 
            onToggle={() => handleToggle(bot.type)} 
            onConfigure={() => setSelectedBot(bot)}
            onViewLogs={() => setViewLogsBot(bot)}
            onViewWork={() => handleViewWork(bot)}
          />
        ))}
      </div>

      {/* Config Modal */}
      {selectedBot && (
        <BotConfigModal 
          bot={selectedBot} 
          onClose={() => setSelectedBot(null)} 
          onSave={handleSaveConfig} 
        />
      )}

      {/* Audit Logs Modal */}
      {viewLogsBot && (
        <BotLogsModal 
          bot={viewLogsBot}
          onClose={() => setViewLogsBot(null)}
        />
      )}
    </div>
  );
};

// Sub-component for Apple-style Tile
interface BotCardProps {
    bot: BotConfig;
    onToggle: () => void;
    onConfigure: () => void;
    onViewLogs: () => void;
    onViewWork: () => void;
}

const BotCard: React.FC<BotCardProps> = ({ bot, onToggle, onConfigure, onViewLogs, onViewWork }) => {
  const isRunning = bot.enabled && bot.status === 'Running';
  const isCooldown = bot.status === 'Cooldown';
  const isLimitReached = bot.status === 'LimitReached';
  const isError = bot.status === 'Error';

  // Stats Calculation
  const usagePercent = Math.min((bot.stats.currentDailyActions / bot.stats.maxDailyActions) * 100, 100);
  
  // Icon Mapping
  const getIcon = () => {
    switch (bot.type) {
      case BotType.Creator: return <Zap strokeWidth={2} className="w-6 h-6 text-white" />;
      case BotType.Engagement: return <Target strokeWidth={2} className="w-6 h-6 text-white" />;
      case BotType.Finder: return <Search strokeWidth={2} className="w-6 h-6 text-white" />;
      case BotType.Growth: return <TrendingUp strokeWidth={2} className="w-6 h-6 text-white" />;
      default: return <Bot strokeWidth={2} className="w-6 h-6 text-white" />;
    }
  };

  // Color Mapping
  const getColor = () => {
    if (isError) return 'bg-red-500 shadow-red-500/30';
    if (isLimitReached) return 'bg-orange-500 shadow-orange-500/30';
    if (isCooldown) return 'bg-yellow-500 shadow-yellow-500/30';

    switch (bot.type) {
      case BotType.Creator: return 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-orange-500/30';
      case BotType.Engagement: return 'bg-gradient-to-br from-blue-400 to-indigo-500 shadow-blue-500/30';
      case BotType.Finder: return 'bg-gradient-to-br from-purple-400 to-pink-500 shadow-pink-500/30';
      case BotType.Growth: return 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/30';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = () => {
    if (isError) return 'Stopped (Error)';
    if (isLimitReached) return 'Daily Limit Reached';
    if (isCooldown) return `Cooling Down`;
    if (isRunning) return 'Active & Running';
    return 'Paused';
  };

  return (
    <div className={`group relative overflow-hidden rounded-[32px] p-6 transition-all duration-300 apple-ease border 
      ${isError ? 'border-red-200 bg-red-50' : 
        isLimitReached ? 'border-orange-200 bg-orange-50' :
        isCooldown ? 'border-yellow-200 bg-yellow-50' :
        isRunning ? 'bg-white border-white/50 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] scale-[1.005]' : 
        'bg-[#FDFDFD] border-white/50 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] opacity-95'
      }`}>
      
      {/* Background decoration */}
      <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-5 blur-3xl transition-opacity duration-500 ${getColor().split(' ')[0]} ${bot.enabled ? 'opacity-10' : 'opacity-0'}`}></div>

      <div className="flex flex-col h-full relative z-10">
        
        {/* Top Row: Icon & Toggle */}
        <div className="flex justify-between items-start mb-4">
          <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 ${getColor()}`}>
            {getIcon()}
          </div>
          
          <div className="flex items-center gap-3">
             <button 
                onClick={onViewLogs}
                className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 text-gray-500 hover:text-black flex items-center justify-center transition-colors shadow-sm border border-black/5"
                title="View Audit Logs"
             >
                <FileText className="w-5 h-5" />
             </button>
             <button 
                onClick={onConfigure}
                className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 text-gray-500 hover:text-black flex items-center justify-center transition-colors shadow-sm border border-black/5"
                title="Configure Bot Rules"
             >
                <Settings className="w-5 h-5" />
             </button>
             <button 
               onClick={onToggle}
               className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none shadow-inner
                 ${bot.enabled ? 'bg-green-500' : 'bg-gray-200'}`}
             >
               <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)
                 ${bot.enabled ? 'translate-x-6' : 'translate-x-0'}`} 
               />
             </button>
          </div>
        </div>

        {/* Info */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-[#1d1d1f] tracking-tight mb-1">{bot.type}</h3>
          <p className="text-xs text-gray-500 mb-3 font-medium leading-relaxed max-w-[95%]">
             {BOT_DESCRIPTIONS[bot.type]}
          </p>
          
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full 
               ${isError ? 'bg-red-500' : 
                 isLimitReached ? 'bg-orange-500' : 
                 isCooldown ? 'bg-yellow-500 animate-pulse' : 
                 isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}
            `}></div>
            <span className={`text-sm font-semibold ${isError ? 'text-red-600' : isLimitReached ? 'text-orange-600' : isCooldown ? 'text-yellow-600' : 'text-gray-500'}`}>
              {getStatusLabel()}
            </span>
            {isCooldown && bot.stats.cooldownEndsAt && (
               <span className="text-xs text-yellow-600 font-mono bg-yellow-100 px-2 py-0.5 rounded">
                 {Math.ceil((new Date(bot.stats.cooldownEndsAt).getTime() - Date.now()) / 60000)}m left
               </span>
            )}
          </div>

          {/* Safety Health Bar */}
          <div className="w-full bg-black/5 rounded-full h-1.5 mb-1 overflow-hidden">
             <div 
               className={`h-full rounded-full transition-all duration-500 
                  ${isLimitReached ? 'bg-orange-500' : usagePercent > 80 ? 'bg-yellow-500' : 'bg-green-500'}
               `}
               style={{ width: `${usagePercent}%` }}
             ></div>
          </div>
          <div className="flex justify-between text-[10px] font-medium text-gray-400 uppercase tracking-wide">
             <span>Daily Cap</span>
             <span>{bot.stats.currentDailyActions} / {bot.stats.maxDailyActions} Actions</span>
          </div>
        </div>
        
        {/* Integration Stats Section */}
        {bot.stats.itemsCreated && bot.stats.itemsCreated > 0 && (
           <div className="mb-4 bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {bot.type === BotType.Creator ? 'Generated Assets' : 'Total Interactions'}
                 </p>
                 <p className="text-lg font-bold text-gray-800">
                    {bot.stats.itemsCreated.toLocaleString()}
                 </p>
              </div>
              <button 
                 onClick={onViewWork}
                 className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1"
              >
                 View All <ChevronRight className="w-3 h-3" />
              </button>
           </div>
        )}

        {/* Live Feed (Replaces Terminal) */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-1 flex-1 min-h-[140px] border border-black/5 shadow-inner flex flex-col">
          <div className="px-3 py-2 border-b border-black/5 flex justify-between items-center">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Live Activity</span>
             <div className="flex gap-1">
               <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
             </div>
          </div>
          <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
             {bot.logs.length > 0 ? (
               bot.logs.slice(0, 5).map((log, i) => (
                 <div key={i} className="flex gap-3 items-start animate-in slide-in-from-bottom-2 duration-300">
                    <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.1)] 
                       ${log.level === 'Error' ? 'bg-red-400' : log.level === 'Warning' ? 'bg-orange-400' : 'bg-blue-400'}
                    `}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 font-medium leading-relaxed truncate">{log.message}</p>
                      <p className="text-[9px] text-gray-400 font-mono mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</p>
                    </div>
                 </div>
               ))
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 opacity-60">
                  <Pause className="w-5 h-5" />
                  <span className="text-xs font-medium">No recent activity</span>
               </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

// --- Logs Modal ---

interface BotLogsModalProps {
  bot: BotConfig;
  onClose: () => void;
}

const BotLogsModal: React.FC<BotLogsModalProps> = ({ bot, onClose }) => {
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'All'>('All');
  const [filterPeriod, setFilterPeriod] = useState<'24h' | '7d' | 'All'>('24h');
  const [filteredLogs, setFilteredLogs] = useState<BotLogEntry[]>([]);

  useEffect(() => {
    let logs = bot.logs;

    // Filter by Level
    if (filterLevel !== 'All') {
      logs = logs.filter(l => l.level === filterLevel);
    }

    // Filter by Time
    const now = new Date();
    if (filterPeriod === '24h') {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      logs = logs.filter(l => new Date(l.timestamp) > yesterday);
    } else if (filterPeriod === '7d') {
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      logs = logs.filter(l => new Date(l.timestamp) > lastWeek);
    }

    setFilteredLogs(logs);
  }, [bot, filterLevel, filterPeriod]);

  const handleExport = () => {
    const headers = ['Timestamp', 'Level', 'Message'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(l => `${new Date(l.timestamp).toLocaleString()},${l.level},"${l.message.replace(/"/g, '""')}"`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bot.type.replace(/\s/g, '_')}_AuditLog_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getLevelBadgeColor = (level: LogLevel) => {
    switch (level) {
      case 'Error': return 'bg-red-100 text-red-700';
      case 'Warning': return 'bg-orange-100 text-orange-700';
      case 'Success': return 'bg-green-100 text-green-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl flex flex-col h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
             <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
               <FileText className="w-5 h-5 text-gray-500" />
               Audit Trail: {bot.type}
             </h2>
             <p className="text-sm text-gray-500">Historical logs and system events.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
             <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Time Filter */}
            <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
              {['24h', '7d', 'All'].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPeriod(p as any)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${filterPeriod === p ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Level Filter */}
            <div className="relative group">
               <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 cursor-pointer">
                 <Filter className="w-3.5 h-3.5" />
                 {filterLevel === 'All' ? 'All Events' : filterLevel}
               </div>
               <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-100 hidden group-hover:block z-20 py-1">
                  {['All', 'Info', 'Success', 'Warning', 'Error'].map(lvl => (
                    <button 
                      key={lvl} 
                      onClick={() => setFilterLevel(lvl as any)}
                      className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-gray-50 text-gray-700"
                    >
                      {lvl}
                    </button>
                  ))}
               </div>
            </div>
          </div>

          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>

        {/* Log Table */}
        <div className="flex-1 overflow-auto custom-scrollbar p-0 bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-40">Timestamp</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-24">Level</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Event ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-3 text-xs font-mono text-gray-500 whitespace-nowrap">
                       {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                       <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${getLevelBadgeColor(log.level)}`}>
                         {log.level}
                       </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700 font-medium">
                       {log.message}
                    </td>
                    <td className="px-6 py-3 text-right text-xs text-gray-300 font-mono group-hover:text-gray-400">
                       {log.id}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 opacity-20" />
                        <p>No logs found for the selected criteria.</p>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-[32px] flex justify-between items-center text-xs text-gray-400">
           <span>Showing {filteredLogs.length} events</span>
           <span>Server Time: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

// --- Configuration Modal ---

interface BotConfigModalProps {
  bot: BotConfig;
  onClose: () => void;
  onSave: (bot: BotConfig) => void;
}

const BotConfigModal: React.FC<BotConfigModalProps> = ({ bot, onClose, onSave }) => {
  // Local state for editing form
  const [config, setConfig] = useState<BotSpecificConfig>({ ...bot.config });
  const [aiStrategy, setAiStrategy] = useState<AIStrategyConfig>({
    creativityLevel: 'Medium',
    brandVoice: 'Professional',
    keywordsToInclude: [],
    topicsToAvoid: [],
    ...bot.config.aiStrategy // Merge existing strategy
  });
  const [activeTab, setActiveTab] = useState<'General' | 'Strategy' | 'Safety'>('General');
  const [interval, setInterval] = useState(bot.intervalMinutes);
  
  // Helper to update specific config fields
  const updateConfig = (key: keyof BotSpecificConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateStrategy = (key: keyof AIStrategyConfig, value: any) => {
    setAiStrategy(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Also update limits in stats for immediate feedback
    const maxDaily = config.maxDailyInteractions || 50; 

    onSave({
      ...bot,
      intervalMinutes: interval,
      config: {
        ...config,
        aiStrategy: aiStrategy
      },
      stats: {
         ...bot.stats,
         maxDailyActions: maxDaily
      }
    });
  };

  const renderCreatorFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Content Topics</label>
        <input 
          type="text" 
          value={config.contentTopics?.join(', ') || ''}
          onChange={(e) => updateConfig('contentTopics', e.target.value.split(',').map(s => s.trim()))}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="e.g. AI, Startups, Design"
        />
      </div>
      
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Target Platforms</label>
        <div className="flex flex-wrap gap-2">
          {Object.values(Platform).map(p => {
             const isSelected = config.targetPlatforms?.includes(p);
             return (
               <button 
                 key={p} 
                 onClick={() => {
                    const current = config.targetPlatforms || [];
                    const updated = isSelected ? current.filter(x => x !== p) : [...current, p];
                    updateConfig('targetPlatforms', updated);
                 }}
                 className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-colors ${isSelected ? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
               >
                 <PlatformIcon platform={p} size={12} white={isSelected} /> {p}
               </button>
             );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
         <span className="text-sm font-medium text-gray-700">Use AI Generation</span>
         <button 
           onClick={() => updateConfig('generationMode', config.generationMode === 'AI' ? 'Drafts' : 'AI')}
           className={`relative w-11 h-6 rounded-full transition-colors ${config.generationMode === 'AI' ? 'bg-green-500' : 'bg-gray-300'}`}
         >
           <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${config.generationMode === 'AI' ? 'translate-x-5' : 'translate-x-0'}`} />
         </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Time</label>
           <input type="time" value={config.workHoursStart || '09:00'} onChange={(e) => updateConfig('workHoursStart', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Time</label>
           <input type="time" value={config.workHoursEnd || '17:00'} onChange={(e) => updateConfig('workHoursEnd', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" />
        </div>
      </div>
    </div>
  );

  const renderEngagementFields = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
         <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer">
            <input type="checkbox" checked={config.replyToMentions} onChange={(e) => updateConfig('replyToMentions', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
            <span className="text-sm font-medium text-gray-700">Reply to Mentions</span>
         </label>
         <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer">
            <input type="checkbox" checked={config.replyToComments} onChange={(e) => updateConfig('replyToComments', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
            <span className="text-sm font-medium text-gray-700">Reply to Comments</span>
         </label>
         <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer">
            <input type="checkbox" checked={config.enableAutoLike} onChange={(e) => updateConfig('enableAutoLike', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
            <span className="text-sm font-medium text-gray-700">Auto-Like Relevant Posts</span>
         </label>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Watch Hashtags</label>
        <input 
          type="text" 
          value={config.watchHashtags?.join(', ') || ''}
          onChange={(e) => updateConfig('watchHashtags', e.target.value.split(',').map(s => s.trim()))}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
          placeholder="#Tech, #News"
        />
      </div>
    </div>
  );

  const renderFinderFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Track Keywords</label>
        <input 
          type="text" 
          value={config.trackKeywords?.join(', ') || ''}
          onChange={(e) => updateConfig('trackKeywords', e.target.value.split(',').map(s => s.trim()))}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
          placeholder="AI, Machine Learning"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Competitors</label>
        <input 
          type="text" 
          value={config.trackAccounts?.join(', ') || ''}
          onChange={(e) => updateConfig('trackAccounts', e.target.value.split(',').map(s => s.trim()))}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
          placeholder="@competitor1, @competitor2"
        />
      </div>
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer">
         <input type="checkbox" checked={config.autoSaveToDrafts} onChange={(e) => updateConfig('autoSaveToDrafts', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
         <span className="text-sm font-medium text-gray-700">Auto-save trending posts to Drafts</span>
      </div>
    </div>
  );

  const renderGrowthFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Target Hashtags (Community)</label>
        <input 
          type="text" 
          value={config.growthTags?.join(', ') || ''}
          onChange={(e) => updateConfig('growthTags', e.target.value.split(',').map(s => s.trim()))}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
          placeholder="#Community, #FollowBack"
        />
      </div>
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer">
         <input type="checkbox" checked={config.interactWithCompetitors} onChange={(e) => updateConfig('interactWithCompetitors', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
         <span className="text-sm font-medium text-gray-700">Engage with Competitor's Followers</span>
      </div>
    </div>
  );

  const renderStrategyFields = () => (
    <div className="space-y-6">
       <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex gap-3">
          <BrainCircuit className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div>
             <h4 className="text-sm font-bold text-purple-800">AI Strategy</h4>
             <p className="text-xs text-purple-700 mt-1 leading-relaxed">
                Configure how Gemini generates content. These settings help maintain a consistent brand voice.
             </p>
          </div>
       </div>

       {/* Creativity Level */}
       <div>
          <label className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase mb-2">
             <span>Creativity (Temperature)</span>
             <span className="text-purple-600">{aiStrategy.creativityLevel}</span>
          </label>
          <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
             <span className="text-xs font-bold text-gray-400">Factual</span>
             <input 
               type="range" min="0" max="2" step="1"
               value={aiStrategy.creativityLevel === 'Low' ? 0 : aiStrategy.creativityLevel === 'Medium' ? 1 : 2}
               onChange={(e) => {
                  const val = parseInt(e.target.value);
                  updateStrategy('creativityLevel', val === 0 ? 'Low' : val === 1 ? 'Medium' : 'High');
               }}
               className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
             />
             <span className="text-xs font-bold text-gray-400">Creative</span>
          </div>
       </div>

       {/* Brand Voice */}
       <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Brand Voice</label>
          <div className="flex flex-wrap gap-2">
             {['Professional', 'Friendly', 'Witty', 'Empathetic', 'Urgent', 'Technical'].map(voice => (
                <button
                   key={voice}
                   onClick={() => updateStrategy('brandVoice', voice)}
                   className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      aiStrategy.brandVoice === voice 
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                   }`}
                >
                   {voice}
                </button>
             ))}
          </div>
       </div>

       {/* Keywords to Include */}
       <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Push Keywords</label>
          <div className="flex flex-wrap gap-2 p-3 bg-white border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-purple-500/20 transition-shadow">
             {aiStrategy.keywordsToInclude.map((kw, i) => (
                <span key={i} className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-bold border border-green-100">
                   {kw}
                   <button onClick={() => updateStrategy('keywordsToInclude', aiStrategy.keywordsToInclude.filter((_, idx) => idx !== i))} className="hover:bg-green-100 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                </span>
             ))}
             <input 
               type="text" 
               placeholder="Add keyword..." 
               className="flex-1 min-w-[100px] text-sm outline-none bg-transparent"
               onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                     const val = e.currentTarget.value.trim();
                     if (val && !aiStrategy.keywordsToInclude.includes(val)) {
                        updateStrategy('keywordsToInclude', [...aiStrategy.keywordsToInclude, val]);
                        e.currentTarget.value = '';
                     }
                  }
               }}
             />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">AI will prioritize these terms in generated content.</p>
       </div>

       {/* Topics to Avoid */}
       <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Negative Constraints (Avoid)</label>
          <div className="flex flex-wrap gap-2 p-3 bg-white border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-red-500/20 transition-shadow">
             {aiStrategy.topicsToAvoid.map((topic, i) => (
                <span key={i} className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs font-bold border border-red-100">
                   {topic}
                   <button onClick={() => updateStrategy('topicsToAvoid', aiStrategy.topicsToAvoid.filter((_, idx) => idx !== i))} className="hover:bg-red-100 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                </span>
             ))}
             <input 
               type="text" 
               placeholder="Add topic..." 
               className="flex-1 min-w-[100px] text-sm outline-none bg-transparent"
               onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                     const val = e.currentTarget.value.trim();
                     if (val && !aiStrategy.topicsToAvoid.includes(val)) {
                        updateStrategy('topicsToAvoid', [...aiStrategy.topicsToAvoid, val]);
                        e.currentTarget.value = '';
                     }
                  }
               }}
             />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">AI will strictly avoid these subjects.</p>
       </div>
    </div>
  );

  const renderSafetyFields = () => (
    <div className="space-y-6">
       {/* Global Warning */}
       <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex gap-3">
          <Shield className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div>
             <h4 className="text-sm font-bold text-orange-800">Account Safety</h4>
             <p className="text-xs text-orange-700 mt-1 leading-relaxed">
                Stricter limits reduce the risk of platform bans. We recommend keeping "Safe Mode" enabled.
             </p>
          </div>
       </div>

       {/* Limits */}
       <div className="grid grid-cols-2 gap-4">
          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Daily Action Limit</label>
             <input 
               type="number" 
               value={config.maxDailyInteractions || 50} 
               onChange={(e) => updateConfig('maxDailyInteractions', parseInt(e.target.value))} 
               className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold" 
             />
             <p className="text-[10px] text-gray-400 mt-1">Actions per 24 hours</p>
          </div>
          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Hourly Cap</label>
             <input 
               type="number" 
               value={config.hourlyActionLimit || 10} 
               onChange={(e) => updateConfig('hourlyActionLimit', parseInt(e.target.value))} 
               className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold" 
             />
             <p className="text-[10px] text-gray-400 mt-1">Actions per hour</p>
          </div>
       </div>

       {/* Throttling */}
       <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Action Delay (Throttling)</label>
          <div className="flex items-center gap-4">
             <div className="flex-1">
                <div className="flex justify-between mb-1">
                   <span className="text-xs text-gray-500">Min Delay</span>
                   <span className="text-xs font-bold">{config.minDelaySeconds || 30}s</span>
                </div>
                <input 
                   type="range" min="10" max="300" step="10"
                   value={config.minDelaySeconds || 30}
                   onChange={(e) => updateConfig('minDelaySeconds', parseInt(e.target.value))}
                   className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
             </div>
             <div className="flex-1">
                <div className="flex justify-between mb-1">
                   <span className="text-xs text-gray-500">Max Delay</span>
                   <span className="text-xs font-bold">{config.maxDelaySeconds || 120}s</span>
                </div>
                <input 
                   type="range" min="60" max="600" step="10"
                   value={config.maxDelaySeconds || 120}
                   onChange={(e) => updateConfig('maxDelaySeconds', parseInt(e.target.value))}
                   className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
             </div>
          </div>
       </div>

       {/* Error Handling */}
       <div className="bg-red-50 p-4 rounded-xl border border-red-100 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
             <input 
               type="checkbox" 
               checked={!!config.stopOnConsecutiveErrors} 
               onChange={(e) => updateConfig('stopOnConsecutiveErrors', e.target.checked ? 3 : 0)} 
               className="rounded text-red-600 focus:ring-red-500" 
             />
             <span className="text-sm font-bold text-red-800">Auto-Stop on Errors</span>
          </label>
          {config.stopOnConsecutiveErrors ? (
             <div className="flex items-center gap-2 text-xs text-red-700">
                <AlertOctagon className="w-3 h-3" />
                <span>Bot will pause after 3 consecutive API failures.</span>
             </div>
          ) : null}
       </div>
       
       {/* Blocklist */}
       <div>
         <label className="block text-sm font-bold text-gray-700 mb-2">Blacklisted Keywords</label>
         <input 
           type="text" 
           value={config.mutedKeywords?.join(', ') || ''}
           onChange={(e) => updateConfig('mutedKeywords', e.target.value.split(',').map(s => s.trim()))}
           className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
           placeholder="NSFW, Spam, CompetitorName"
         />
       </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
       <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
          
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
             <div>
                <h2 className="text-xl font-bold text-gray-900">Configure {bot.type}</h2>
                <p className="text-sm text-gray-500">{BOT_DESCRIPTIONS[bot.type]}</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                <X className="w-5 h-5" />
             </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-6 overflow-x-auto no-scrollbar">
             <button 
                onClick={() => setActiveTab('General')}
                className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'General' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
             >
                General Settings
             </button>
             <button 
                onClick={() => setActiveTab('Strategy')}
                className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'Strategy' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
             >
                <BrainCircuit className="w-4 h-4" /> AI Strategy
             </button>
             <button 
                onClick={() => setActiveTab('Safety')}
                className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'Safety' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
             >
                <Shield className="w-4 h-4" /> Safety
             </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
             
             {activeTab === 'General' && (
                <>
                   {/* Common Settings */}
                   <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Check Interval (Minutes)</label>
                      <div className="flex items-center gap-3">
                         <Clock className="w-5 h-5 text-gray-400" />
                         <input 
                           type="range" 
                           min="15" 
                           max="360" 
                           step="15" 
                           value={interval} 
                           onChange={(e) => setInterval(parseInt(e.target.value))}
                           className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                         />
                         <span className="w-12 text-sm font-bold text-gray-900 text-right">{interval}m</span>
                      </div>
                   </div>
                   <hr className="my-6 border-gray-100" />
                   {/* Specific Settings */}
                   {bot.type === BotType.Creator && renderCreatorFields()}
                   {bot.type === BotType.Engagement && renderEngagementFields()}
                   {bot.type === BotType.Finder && renderFinderFields()}
                   {bot.type === BotType.Growth && renderGrowthFields()}
                </>
             )}

             {activeTab === 'Strategy' && renderStrategyFields()}

             {activeTab === 'Safety' && renderSafetyFields()}
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-[32px] flex justify-end gap-3">
             <button onClick={onClose} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
             <button onClick={handleSave} className="px-5 py-2.5 bg-black text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Configuration
             </button>
          </div>
       </div>
    </div>
  );
};
