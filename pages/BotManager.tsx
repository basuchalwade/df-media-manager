
import React, { useEffect, useState } from 'react';
import { Bot, Power, Clock, Zap, Target, TrendingUp, Search, Activity, Pause, Play, ChevronRight, Settings, X, Save, Check, Shield, AlertTriangle, AlertOctagon, Hourglass, FileText, Download, Filter, Calendar, ExternalLink, BrainCircuit, Wand2, Plus, Minus, Info, RefreshCw, MessageCircle, ThumbsUp, UserPlus, Eye } from 'lucide-react';
import { store } from '../services/mockStore';
import { BotConfig, BotType, Platform, BotSpecificConfig, BotLogEntry, LogLevel, AIStrategyConfig, CalendarConfig } from '../types';
import { PlatformIcon } from '../components/PlatformIcon';

// --- Constants ---

const BOT_DESCRIPTIONS: Record<BotType, string> = {
  [BotType.Creator]: "Autonomous content engine that drafts and posts high-quality content based on your topics and brand voice.",
  [BotType.Engagement]: "Community manager that handles replies, likes, and interactions to keep your audience engaged.",
  [BotType.Finder]: "Trend scout that monitors keywords and competitors to find new opportunities and content ideas.",
  [BotType.Growth]: "Audience builder that executes safe follow/unfollow strategies to organically grow your reach."
};

const SAFETY_LEVELS = {
  Conservative: { color: 'bg-green-100 text-green-800 border-green-200', icon: Shield, desc: 'Strict limits. Lowest risk.' },
  Moderate: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Shield, desc: 'Balanced growth and safety.' },
  Aggressive: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle, desc: 'High volume. Higher risk.' }
};

// --- Main Component ---

interface BotManagerProps {
  onNavigate?: (page: string, params?: any) => void;
}

export const BotManager: React.FC<BotManagerProps> = ({ onNavigate }) => {
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

  const handleViewWork = (bot: BotConfig) => {
     if (onNavigate) {
       onNavigate('calendar', { filterAuthor: bot.type });
     }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex items-end justify-between px-2">
        <div>
          <h1 className="text-[34px] font-bold text-[#1d1d1f] tracking-tight leading-tight">Bot Manager</h1>
          <p className="text-gray-500 text-lg font-medium leading-relaxed mt-1">
            Configure, monitor, and simulate your autonomous agents.
          </p>
        </div>
        <div className="flex gap-2">
           <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-black/5 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Shield className="w-4 h-4 text-green-500" />
              Global Safety Engine: Active
           </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {bots.map((bot) => (
          <BotCard 
            key={bot.type} 
            bot={bot} 
            onToggle={() => handleToggle(bot.type)} 
            onConfigure={() => setSelectedBot(bot)}
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
    </div>
  );
};

// --- Bot Card ---

interface BotCardProps {
    bot: BotConfig;
    onToggle: () => void;
    onConfigure: () => void;
    onViewWork: () => void;
}

const BotCard: React.FC<BotCardProps> = ({ bot, onToggle, onConfigure, onViewWork }) => {
  const isRunning = bot.enabled && bot.status === 'Running';
  const isCooldown = bot.status === 'Cooldown';
  const isLimitReached = bot.status === 'LimitReached';
  const isError = bot.status === 'Error';

  const usagePercent = Math.min((bot.stats.currentDailyActions / bot.stats.maxDailyActions) * 100, 100);
  
  const getIcon = () => {
    switch (bot.type) {
      case BotType.Creator: return <Zap strokeWidth={2} className="w-6 h-6 text-white" />;
      case BotType.Engagement: return <Target strokeWidth={2} className="w-6 h-6 text-white" />;
      case BotType.Finder: return <Search strokeWidth={2} className="w-6 h-6 text-white" />;
      case BotType.Growth: return <TrendingUp strokeWidth={2} className="w-6 h-6 text-white" />;
      default: return <Bot strokeWidth={2} className="w-6 h-6 text-white" />;
    }
  };

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
      
      <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-5 blur-3xl transition-opacity duration-500 ${getColor().split(' ')[0]} ${bot.enabled ? 'opacity-10' : 'opacity-0'}`}></div>

      <div className="flex flex-col h-full relative z-10">
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

        <div className="mb-4">
          <h3 className="text-xl font-bold text-[#1d1d1f] tracking-tight mb-1">{bot.type}</h3>
          <p className="text-xs text-gray-500 mb-3 font-medium leading-relaxed max-w-[95%] line-clamp-2">
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
          </div>

          {/* Safety Gauge */}
          <div className="w-full bg-black/5 rounded-full h-1.5 mb-1 overflow-hidden">
             <div 
               className={`h-full rounded-full transition-all duration-500 
                  ${isLimitReached ? 'bg-orange-500' : usagePercent > 80 ? 'bg-yellow-500' : 'bg-green-500'}
               `}
               style={{ width: `${usagePercent}%` }}
             ></div>
          </div>
          <div className="flex justify-between text-[10px] font-medium text-gray-400 uppercase tracking-wide">
             <span>Usage</span>
             <span>{bot.stats.currentDailyActions} / {bot.stats.maxDailyActions} Actions</span>
          </div>
        </div>
        
        {/* Action Button */}
        <button 
           onClick={onViewWork}
           className="mt-auto w-full py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
           View Activity <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

// --- Structured Config Modal ---

interface BotConfigModalProps {
  bot: BotConfig;
  onClose: () => void;
  onSave: (bot: BotConfig) => void;
}

type TabType = 'Overview' | 'Schedule' | 'Rules' | 'Safety' | 'Simulation';

const BotConfigModal: React.FC<BotConfigModalProps> = ({ bot, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  
  // Local Config State
  const [config, setConfig] = useState<BotSpecificConfig>({ ...bot.config });
  const [interval, setInterval] = useState(bot.intervalMinutes);
  const [aiStrategy, setAiStrategy] = useState<AIStrategyConfig>({
    creativityLevel: 'Medium',
    brandVoice: 'Professional',
    keywordsToInclude: [],
    topicsToAvoid: [],
    ...bot.config.aiStrategy
  });
  
  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any[]>([]);

  // Helpers
  const updateConfig = (key: keyof BotSpecificConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateCalendarConfig = (key: keyof CalendarConfig, value: any) => {
    setConfig(prev => ({
        ...prev,
        calendarConfig: {
            enabled: prev.calendarConfig?.enabled ?? true,
            maxPostsPerDay: prev.calendarConfig?.maxPostsPerDay ?? 3,
            blackoutDates: prev.calendarConfig?.blackoutDates ?? [],
            [key]: value
        }
    }));
  };

  const handleSave = () => {
     const maxDaily = config.maxDailyInteractions || 50; 
     onSave({
      ...bot,
      intervalMinutes: interval,
      config: { ...config, aiStrategy },
      stats: { ...bot.stats, maxDailyActions: maxDaily }
    });
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setSimulationResults([]);
    
    // Simulate API delay
    setTimeout(() => {
        const results = [];
        const count = 3; 
        
        for(let i=0; i<count; i++) {
            if (bot.type === BotType.Creator) {
                results.push({
                    type: 'Post Draft',
                    content: `[Mock AI] This is a ${aiStrategy.brandVoice} post about ${config.contentTopics?.[i % (config.contentTopics.length || 1)] || 'Technology'}. #AI`,
                    status: 'Success'
                });
            } else if (bot.type === BotType.Engagement) {
                 results.push({
                    type: 'Reply',
                    content: `Replying to @user${i}: "This is a great point! Thanks for sharing."`,
                    status: 'Success'
                });
            } else if (bot.type === BotType.Growth) {
                 results.push({
                    type: 'Follow',
                    content: `Followed @potential_lead_${i} (Matches interest in #${config.growthTags?.[0] || 'Tech'})`,
                    status: 'Success'
                });
            } else {
                 results.push({
                    type: 'Insight',
                    content: `Found trending article: "The Future of AI" by Competitor X`,
                    status: 'Success'
                });
            }
        }
        setSimulationResults(results);
        setIsSimulating(false);
    }, 1500);
  };

  // --- Render Sections ---

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
       <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Bot Overview</h3>
          <p className="text-slate-600 text-sm leading-relaxed mb-4">{BOT_DESCRIPTIONS[bot.type]}</p>
          <div className="flex gap-4">
             <div className="bg-slate-100 rounded-xl p-3 flex-1">
                <p className="text-xs font-bold text-slate-500 uppercase">Status</p>
                <div className="flex items-center gap-2 mt-1">
                   <div className={`w-2.5 h-2.5 rounded-full ${bot.enabled ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                   <span className="font-bold text-slate-900">{bot.enabled ? 'Active' : 'Paused'}</span>
                </div>
             </div>
             <div className="bg-slate-100 rounded-xl p-3 flex-1">
                <p className="text-xs font-bold text-slate-500 uppercase">Last Run</p>
                <p className="font-bold text-slate-900 mt-1">{bot.lastRun ? new Date(bot.lastRun).toLocaleTimeString() : 'Never'}</p>
             </div>
             <div className="bg-slate-100 rounded-xl p-3 flex-1">
                <p className="text-xs font-bold text-slate-500 uppercase">Actions Today</p>
                <p className="font-bold text-slate-900 mt-1">{bot.stats.currentDailyActions}</p>
             </div>
          </div>
       </div>

       {/* Recent Activity Log Preview */}
       <div>
          <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
             <Activity className="w-4 h-4 text-slate-500" /> Recent Activity
          </h4>
          <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
             {bot.logs && bot.logs.length > 0 ? (
                <div className="divide-y divide-slate-100">
                   {bot.logs.slice(0, 5).map((log, idx) => (
                      <div key={idx} className="p-3 flex gap-3 text-sm">
                         <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${log.level === 'Error' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                         <div>
                            <p className="text-slate-700">{log.message}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{new Date(log.timestamp).toLocaleString()}</p>
                         </div>
                      </div>
                   ))}
                </div>
             ) : (
                <div className="p-6 text-center text-slate-400 text-sm">No recent activity logs.</div>
             )}
          </div>
       </div>
    </div>
  );

  const renderSchedule = () => {
    // Calculate estimated runs
    const startHour = parseInt(config.workHoursStart?.split(':')[0] || '9');
    const endHour = parseInt(config.workHoursEnd?.split(':')[0] || '17');
    const hoursActive = endHour - startHour;
    const runsPerHour = 60 / interval;
    const totalRuns = Math.floor(hoursActive * runsPerHour);

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
         
         <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex gap-4">
            <div className="bg-white p-2.5 rounded-xl shadow-sm border border-blue-50 h-fit">
               <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
               <h3 className="font-bold text-blue-900 text-sm">Schedule Summary</h3>
               <p className="text-sm text-blue-800/80 mt-1 leading-relaxed">
                  The bot is configured to run approximately <strong>{totalRuns} times per day</strong> between <strong>{config.workHoursStart}</strong> and <strong>{config.workHoursEnd}</strong>.
               </p>
            </div>
         </div>

         {/* Interval */}
         <div>
            <label className="flex items-center justify-between text-sm font-bold text-slate-700 mb-4">
               <span>Run Frequency</span>
               <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs">Every {interval} mins</span>
            </label>
            <input 
              type="range" min="15" max="360" step="15"
              value={interval}
              onChange={(e) => setInterval(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
               <span>Frequent (15m)</span>
               <span>Moderate (60m)</span>
               <span>Sparse (6h)</span>
            </div>
         </div>

         {/* Work Hours */}
         <div className="grid grid-cols-2 gap-6">
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Start Time</label>
               <input 
                 type="time" 
                 value={config.workHoursStart || '09:00'}
                 onChange={(e) => updateConfig('workHoursStart', e.target.value)}
                 className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
               />
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">End Time</label>
               <input 
                 type="time" 
                 value={config.workHoursEnd || '17:00'}
                 onChange={(e) => updateConfig('workHoursEnd', e.target.value)}
                 className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
               />
            </div>
         </div>

         {/* Calendar Awareness (Creator Only) */}
         {bot.type === BotType.Creator && (
            <div className="pt-6 border-t border-slate-100">
               <div className="flex items-center justify-between mb-4">
                  <div>
                     <label className="text-sm font-bold text-slate-900 block">Calendar Awareness</label>
                     <p className="text-xs text-slate-500 mt-1">Skip drafting if daily post limit is reached.</p>
                  </div>
                  <button 
                     onClick={() => updateCalendarConfig('enabled', !config.calendarConfig?.enabled)}
                     className={`relative w-11 h-6 rounded-full transition-colors ${config.calendarConfig?.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                     <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${config.calendarConfig?.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
               </div>
               
               {config.calendarConfig?.enabled && (
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Max Posts Per Day</label>
                      <div className="flex items-center gap-3">
                         <button onClick={() => updateCalendarConfig('maxPostsPerDay', Math.max(1, (config.calendarConfig?.maxPostsPerDay || 3) - 1))} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"><Minus className="w-4 h-4" /></button>
                         <span className="font-bold text-lg w-8 text-center">{config.calendarConfig?.maxPostsPerDay || 3}</span>
                         <button onClick={() => updateCalendarConfig('maxPostsPerDay', (config.calendarConfig?.maxPostsPerDay || 3) + 1)} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"><Plus className="w-4 h-4" /></button>
                      </div>
                   </div>
               )}
            </div>
         )}
      </div>
    );
  };

  const renderRules = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
       
       {/* AI Personality */}
       <div>
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
             <BrainCircuit className="w-4 h-4 text-purple-600" /> AI Personality
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Creativity Level</label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                   {['Low', 'Medium', 'High'].map(lvl => (
                      <button 
                         key={lvl}
                         onClick={() => setAiStrategy(prev => ({ ...prev, creativityLevel: lvl as any }))}
                         className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${aiStrategy.creativityLevel === lvl ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                         {lvl}
                      </button>
                   ))}
                </div>
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tone of Voice</label>
                <select 
                   value={aiStrategy.brandVoice}
                   onChange={(e) => setAiStrategy(prev => ({ ...prev, brandVoice: e.target.value }))}
                   className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-purple-500"
                >
                   <option>Professional</option>
                   <option>Friendly</option>
                   <option>Witty</option>
                   <option>Empathetic</option>
                   <option>Urgent</option>
                </select>
             </div>
          </div>
       </div>

       {/* Bot Specific Rules */}
       <div className="pt-6 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
             <Wand2 className="w-4 h-4 text-blue-600" /> Operational Rules
          </h3>

          {bot.type === BotType.Creator && (
              <div className="space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Content Topics</label>
                     <textarea 
                        value={config.contentTopics?.join(', ') || ''}
                        onChange={(e) => updateConfig('contentTopics', e.target.value.split(',').map(s => s.trim()))}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
                        placeholder="e.g. Artificial Intelligence, Web Development, Productivity Hacks"
                     />
                     <p className="text-xs text-slate-400 mt-2">Separate topics with commas.</p>
                  </div>
              </div>
          )}

          {bot.type === BotType.Engagement && (
              <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                     <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={config.replyToMentions} onChange={(e) => updateConfig('replyToMentions', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-medium text-slate-700">Reply to Mentions</span>
                     </label>
                     <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={config.replyToComments} onChange={(e) => updateConfig('replyToComments', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-medium text-slate-700">Reply to Comments on Posts</span>
                     </label>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Monitor Hashtags</label>
                     <input 
                       type="text" 
                       value={config.watchHashtags?.join(', ') || ''} 
                       onChange={(e) => updateConfig('watchHashtags', e.target.value.split(',').map(s => s.trim()))}
                       className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                       placeholder="#Tech, #News"
                     />
                  </div>
              </div>
          )}
          
          {(bot.type === BotType.Finder || bot.type === BotType.Growth) && (
              <div className="space-y-4">
                 <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{bot.type === BotType.Growth ? 'Growth Targets' : 'Tracking Keywords'}</label>
                     <input 
                       type="text" 
                       value={(bot.type === BotType.Growth ? config.growthTags : config.trackKeywords)?.join(', ') || ''} 
                       onChange={(e) => updateConfig(bot.type === BotType.Growth ? 'growthTags' : 'trackKeywords', e.target.value.split(',').map(s => s.trim()))}
                       className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                       placeholder="Enter keywords or tags..."
                     />
                 </div>
              </div>
          )}
       </div>
    </div>
  );

  const renderSafety = () => {
     const selectedLevel = Object.entries(SAFETY_LEVELS).find(([k]) => k === (config.safetyLevel || 'Moderate'));
     
     return (
       <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
          
          {/* Safety Level Selector */}
          <div className="grid grid-cols-3 gap-3">
             {Object.entries(SAFETY_LEVELS).map(([level, details]) => {
                const isSelected = (config.safetyLevel || 'Moderate') === level;
                const Icon = details.icon;
                return (
                   <button 
                      key={level}
                      onClick={() => updateConfig('safetyLevel', level)}
                      className={`relative p-3 rounded-xl border text-left transition-all ${isSelected ? details.color + ' ring-1 ring-offset-1 ring-black/5' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                   >
                      <div className="flex items-center gap-2 mb-1">
                         <Icon className="w-4 h-4" />
                         <span className="font-bold text-sm">{level}</span>
                      </div>
                      <p className="text-[10px] opacity-80 leading-tight">{details.desc}</p>
                   </button>
                );
             })}
          </div>

          {/* Limits Visualization */}
          <div>
             <div className="flex justify-between items-end mb-2">
                <label className="text-sm font-bold text-slate-700">Daily Action Cap</label>
                <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{config.maxDailyInteractions || 50} actions</span>
             </div>
             <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                {/* Safe Zone */}
                <div className="h-full bg-green-400 w-1/2" title="Safe Zone"></div>
                {/* Warning Zone */}
                <div className="h-full bg-yellow-400 w-1/4" title="Caution Zone"></div>
                {/* Danger Zone */}
                <div className="h-full bg-red-400 w-1/4" title="High Risk Zone"></div>
             </div>
             <input 
               type="range" min="10" max="200" step="10"
               value={config.maxDailyInteractions || 50}
               onChange={(e) => updateConfig('maxDailyInteractions', parseInt(e.target.value))}
               className="w-full mt-3 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
             />
             <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>10 (Safe)</span>
                <span>200 (Risky)</span>
             </div>
          </div>

          {/* Emergency Stop */}
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
             <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
             <div className="flex-1">
                <h4 className="text-sm font-bold text-red-800">Emergency Circuit Breaker</h4>
                <p className="text-xs text-red-700 mt-1 mb-2">
                   Automatically pause the bot if consecutive errors occur.
                </p>
                <label className="flex items-center gap-2 cursor-pointer">
                   <input 
                      type="checkbox" 
                      checked={!!config.stopOnConsecutiveErrors} 
                      onChange={(e) => updateConfig('stopOnConsecutiveErrors', e.target.checked ? 3 : 0)} 
                      className="rounded text-red-600 focus:ring-red-500" 
                   />
                   <span className="text-xs font-bold text-red-800">Enable (Stops after 3 errors)</span>
                </label>
             </div>
          </div>
       </div>
     );
  };

  const renderSimulation = () => (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
       <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6 text-center">
          <p className="text-sm text-slate-600 mb-4">
             Run a simulation to see what content or actions the bot would generate based on your current settings. 
             <span className="font-bold text-slate-800"> No actual actions will be taken.</span>
          </p>
          <button 
             onClick={runSimulation}
             disabled={isSimulating}
             className="px-6 py-2.5 bg-black text-white rounded-xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
          >
             {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
             {isSimulating ? 'Generating Preview...' : 'Run Simulation'}
          </button>
       </div>

       <div className="flex-1 overflow-y-auto custom-scrollbar">
          {simulationResults.length > 0 ? (
             <div className="space-y-3">
                {simulationResults.map((res, i) => (
                   <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{res.type}</span>
                         <span className="text-[10px] font-bold text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> Valid</span>
                      </div>
                      <p className="text-sm text-slate-800 font-medium leading-relaxed">"{res.content}"</p>
                   </div>
                ))}
             </div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                <BrainCircuit className="w-12 h-12 stroke-1" />
                <p className="text-sm">Simulation results will appear here.</p>
             </div>
          )}
       </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
       <div className="bg-white rounded-[32px] w-full max-w-4xl h-[85vh] flex overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
          
          {/* Sidebar */}
          <div className="w-64 bg-slate-50 border-r border-slate-200 p-6 flex flex-col shrink-0">
             <div className="flex items-center gap-3 mb-8">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-gray-700 to-black shadow-md`}>
                   {bot.type === BotType.Creator && <Zap className="w-5 h-5" />}
                   {bot.type === BotType.Engagement && <Target className="w-5 h-5" />}
                   {bot.type === BotType.Finder && <Search className="w-5 h-5" />}
                   {bot.type === BotType.Growth && <TrendingUp className="w-5 h-5" />}
                </div>
                <div>
                   <h3 className="font-bold text-slate-900 text-sm leading-tight">{bot.type}</h3>
                   <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Configuration</span>
                </div>
             </div>

             <nav className="space-y-1 flex-1">
                {[
                   { id: 'Overview', icon: Info },
                   { id: 'Schedule', icon: Clock },
                   { id: 'Rules', icon: Wand2 },
                   { id: 'Safety', icon: Shield },
                   { id: 'Simulation', icon: Play },
                ].map((item) => (
                   <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as TabType)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id ? 'bg-white text-black shadow-md shadow-slate-200/50' : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`}
                   >
                      <item.icon className="w-4 h-4" strokeWidth={2.5} />
                      {item.id}
                   </button>
                ))}
             </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
             <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                <div className="max-w-2xl mx-auto">
                   <h2 className="text-2xl font-bold text-slate-900 mb-6">{activeTab}</h2>
                   {activeTab === 'Overview' && renderOverview()}
                   {activeTab === 'Schedule' && renderSchedule()}
                   {activeTab === 'Rules' && renderRules()}
                   {activeTab === 'Safety' && renderSafety()}
                   {activeTab === 'Simulation' && renderSimulation()}
                </div>
             </div>

             {/* Footer */}
             <div className="p-6 border-t border-slate-100 bg-white/50 backdrop-blur flex justify-between items-center shrink-0">
                <button onClick={onClose} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">
                   Cancel
                </button>
                <button 
                   onClick={handleSave}
                   className="px-8 py-2.5 bg-black text-white font-bold rounded-xl shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                   <Save className="w-4 h-4" /> Save Configuration
                </button>
             </div>
          </div>

       </div>
    </div>
  );
};
