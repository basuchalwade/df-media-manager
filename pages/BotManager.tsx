
import React, { useEffect, useState } from 'react';
import { Bot, Power, Clock, Zap, Target, TrendingUp, Search, Activity, Pause, Play, ChevronRight, Settings, X, Save, Check, Shield, AlertTriangle, AlertOctagon, Hourglass } from 'lucide-react';
import { store } from '../services/mockStore';
import { BotConfig, BotType, Platform, BotSpecificConfig } from '../types';
import { PlatformIcon } from '../components/PlatformIcon';

const BOT_DESCRIPTIONS: Record<BotType, string> = {
  [BotType.Creator]: "Autonomous content engine that drafts and posts based on your topics.",
  [BotType.Engagement]: "Community manager that handles replies, likes, and interactions.",
  [BotType.Finder]: "Trend scout that monitors keywords and competitors for insights.",
  [BotType.Growth]: "Audience builder that executes safe follow/unfollow strategies."
};

export const BotManager: React.FC = () => {
  const [bots, setBots] = useState<BotConfig[]>([]);
  const [selectedBot, setSelectedBot] = useState<BotConfig | null>(null);

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
    </div>
  );
};

// Sub-component for Apple-style Tile
const BotCard = ({ bot, onToggle, onConfigure }: { bot: BotConfig; onToggle: () => void; onConfigure: () => void }) => {
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
               bot.logs.map((log, i) => (
                 <div key={i} className="flex gap-3 items-start animate-in slide-in-from-bottom-2 duration-300">
                    <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.1)] 
                       ${log.includes('Error') || log.includes('Limit') ? 'bg-red-400' : 'bg-blue-400'}
                    `}></div>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">{log}</p>
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

// --- Configuration Modal ---

interface BotConfigModalProps {
  bot: BotConfig;
  onClose: () => void;
  onSave: (bot: BotConfig) => void;
}

const BotConfigModal: React.FC<BotConfigModalProps> = ({ bot, onClose, onSave }) => {
  // Local state for editing form
  const [config, setConfig] = useState<BotSpecificConfig>({ ...bot.config });
  const [activeTab, setActiveTab] = useState<'General' | 'Safety'>('General');
  const [interval, setInterval] = useState(bot.intervalMinutes);
  
  // Helper to update specific config fields
  const updateConfig = (key: keyof BotSpecificConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Also update limits in stats for immediate feedback
    const maxDaily = config.maxDailyInteractions || 50; 

    onSave({
      ...bot,
      intervalMinutes: interval,
      config: config,
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
          <div className="flex border-b border-gray-100 px-6">
             <button 
                onClick={() => setActiveTab('General')}
                className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'General' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
             >
                General Settings
             </button>
             <button 
                onClick={() => setActiveTab('Safety')}
                className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'Safety' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
             >
                <Shield className="w-4 h-4" /> Safety & Throttling
             </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
             
             {activeTab === 'General' ? (
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
             ) : (
                renderSafetyFields()
             )}
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
