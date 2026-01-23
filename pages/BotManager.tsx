
import React, { useEffect, useState, useRef } from 'react';
import { Bot, Power, Clock, Zap, Target, TrendingUp, Search, Activity, Pause, Play, ChevronRight, Settings, X, Save, Check, Shield, AlertTriangle, AlertOctagon, Hourglass, FileText, Download, Filter, Calendar, ExternalLink, BrainCircuit, Wand2, Plus, Minus, Info, RefreshCw, MessageCircle, ThumbsUp, UserPlus, Eye, Terminal, HelpCircle, CheckCircle, BarChart3, Lock, Sliders, History, ChevronDown, Hash, Users, Server, RotateCcw, ShieldCheck, PauseCircle, ShieldAlert, Copy, ChevronUp, FastForward, Gauge, Bug, XOctagon, Thermometer, ArrowRight, SlidersHorizontal, Sparkles } from 'lucide-react';
import { store } from '../services/mockStore';
import { BotConfig, BotType, Platform, BotSpecificConfig, BotLogEntry, LogLevel, AIStrategyConfig, CalendarConfig, BotActivity, ActivityStatus } from '../types';
import { PlatformIcon } from '../components/PlatformIcon';

// --- Constants ---

const BOT_DESCRIPTIONS: Record<BotType, string> = {
  [BotType.Creator]: "Autonomous content engine that drafts and posts high-quality content based on your topics and brand voice.",
  [BotType.Engagement]: "Community manager that handles replies, likes, and interactions to keep your audience engaged.",
  [BotType.Finder]: "Trend scout that monitors keywords and competitors to find new opportunities and content ideas.",
  [BotType.Growth]: "Audience builder that executes safe follow/unfollow strategies to organically grow your reach."
};

const BOT_CONTEXT_GUIDANCE: Record<string, string> = {
  [BotType.Engagement]: "Automatically replies to mentions and comments within configured limits based on your engagement strategy.",
  [BotType.Finder]: "Continuously tracks specified keywords and accounts to identify leads and content opportunities.",
  [BotType.Growth]: "Manages follow/unfollow behavior and community interactions based on safe growth strategy rules.",
  [BotType.Creator]: "Generates and publishes content based on defined topics and persona settings."
};

const STRATEGIES = ['Professional', 'Viral', 'Educational', 'Empathetic', 'Controversial', 'Witty'];

const SAFETY_LEVELS = {
  Conservative: { 
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200', 
      icon: Shield, 
      label: 'Conservative',
      desc: 'Strict limits. Lowest risk.',
      details: 'Best for new accounts. Mimics human speed with randomized long delays. Strict content filtering.',
      dailyLimit: '~50 Actions',
      speed: 'Human-like',
      riskScore: 20
  },
  Moderate: { 
      color: 'bg-blue-50 text-blue-800 border-blue-200', 
      icon: Shield, 
      label: 'Moderate',
      desc: 'Balanced growth and safety.',
      details: 'Standard operation. Allows occasional bursts of activity while maintaining safe daily limits.',
      dailyLimit: '~150 Actions',
      speed: 'Fast',
      riskScore: 50
  },
  Aggressive: { 
      color: 'bg-orange-50 text-orange-800 border-orange-200', 
      icon: AlertTriangle, 
      label: 'Aggressive',
      desc: 'High volume. Higher risk.',
      details: 'Maximum throughput with minimal delays. Recommended only for verified, high-trust accounts.',
      dailyLimit: '~400 Actions',
      speed: 'Turbo',
      riskScore: 85
  }
};

const SIMULATION_MODES = [
    { id: 'single', label: 'Single Cycle', icon: Play, desc: 'Execute one run immediately.' },
    { id: 'day', label: 'Full Day Preview', icon: FastForward, desc: 'Forecast 24h activity.' },
    { id: 'stress', label: 'Stress Test', icon: Gauge, desc: 'Test rate limit resilience.' },
];

// --- Theme System ---

const TAB_THEMES: Record<string, {
    primary: string;
    secondary: string;
    accentText: string;
    accentBg: string;
    border: string;
    icon: string;
    ring: string;
    sidebarActive: string;
}> = {
    Overview: {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200/50',
        secondary: 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50',
        accentText: 'text-blue-700',
        accentBg: 'bg-blue-50',
        border: 'border-blue-100',
        icon: 'text-blue-500',
        ring: 'focus:ring-blue-500',
        sidebarActive: 'text-blue-700 bg-blue-50 border-blue-200'
    },
    Schedule: {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200/50',
        secondary: 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50',
        accentText: 'text-blue-700',
        accentBg: 'bg-blue-50',
        border: 'border-blue-100',
        icon: 'text-blue-500',
        ring: 'focus:ring-blue-500',
        sidebarActive: 'text-blue-700 bg-blue-50 border-blue-200'
    },
    Rules: {
        primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200/50',
        secondary: 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50',
        accentText: 'text-indigo-700',
        accentBg: 'bg-indigo-50',
        border: 'border-indigo-100',
        icon: 'text-indigo-500',
        ring: 'focus:ring-indigo-500',
        sidebarActive: 'text-indigo-700 bg-indigo-50 border-indigo-200'
    },
    Safety: {
        primary: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200/50',
        secondary: 'bg-white border-amber-200 text-amber-700 hover:bg-amber-50',
        accentText: 'text-amber-700',
        accentBg: 'bg-amber-50',
        border: 'border-amber-100',
        icon: 'text-amber-500',
        ring: 'focus:ring-amber-500',
        sidebarActive: 'text-amber-700 bg-amber-50 border-amber-200'
    },
    Simulation: {
        primary: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200/50',
        secondary: 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50',
        accentText: 'text-purple-700',
        accentBg: 'bg-purple-50',
        border: 'border-purple-100',
        icon: 'text-purple-500',
        ring: 'focus:ring-purple-500',
        sidebarActive: 'text-purple-700 bg-purple-50 border-purple-200'
    }
};

// --- Helper Functions for Time ---

const parseTime = (timeStr: string) => {
    // Expects HH:MM (24h)
    if (!timeStr) return { hour: '12', minute: '00', period: 'PM' };
    let [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; // 0 becomes 12
    return { 
        hour: h.toString(), 
        minute: m.toString().padStart(2, '0'), 
        period 
    };
};

const formatTo24H = (h: string, m: string, p: string) => {
    let hour = parseInt(h);
    const minute = parseInt(m);
    if (p === 'PM' && hour !== 12) hour += 12;
    if (p === 'AM' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

const getMinutesFromMidnight = (timeStr: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
};

// --- Sub Components ---

const ReadOnlyRow = ({ label, value, icon: Icon }: any) => (
    <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0 group">
        <div className="flex items-center gap-2.5 text-sm text-slate-600 font-medium">
            {Icon && <div className="p-1.5 bg-slate-50 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all"><Icon className="w-3.5 h-3.5 text-slate-400" /></div>}
            <span>{label}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-100 group-hover:border-slate-200 transition-colors">{value}</span>
            <Lock className="w-3 h-3 text-slate-300 opacity-50" />
        </div>
    </div>
);

// --- Time Picker Component ---

interface TimePickerProps {
    label: string;
    value: string; // 24h format HH:MM
    onChange: (newValue: string) => void;
    hasError?: boolean;
    theme: typeof TAB_THEMES['Schedule'];
}

const TimePickerInput: React.FC<TimePickerProps> = ({ label, value, onChange, hasError, theme }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { hour, minute, period } = parseTime(value);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (type: 'hour' | 'minute' | 'period', val: string) => {
        let newH = hour;
        let newM = minute;
        let newP = period;

        if (type === 'hour') newH = val;
        if (type === 'minute') newM = val;
        if (type === 'period') newP = val;

        onChange(formatTo24H(newH, newM, newP));
    };

    return (
        <div className="relative" ref={containerRef}>
            <label className={`absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold uppercase z-10 ${hasError ? 'text-red-500' : 'text-slate-400'}`}>
                {label}
            </label>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full p-3 bg-white border rounded-xl text-sm font-bold text-slate-900 flex items-center justify-between transition-shadow
                    ${hasError 
                        ? 'border-red-300 ring-2 ring-red-100' 
                        : `${theme.border} hover:border-blue-300 ${isOpen ? theme.ring + ' ring-2' : ''}`
                    }
                `}
            >
                <span className="font-mono text-base">{hour}:{minute} {period}</span>
                <Clock className={`w-4 h-4 ${hasError ? 'text-red-400' : 'text-slate-400'}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-3 animate-in fade-in zoom-in-95 duration-150">
                    <div className="grid grid-cols-3 gap-2">
                        {/* Hour Column */}
                        <div className="flex flex-col gap-1 h-32 overflow-y-auto custom-scrollbar p-1">
                            <span className="text-[9px] font-bold text-slate-400 text-center uppercase mb-1">Hour</span>
                            {Array.from({length: 12}, (_, i) => i + 1).map(h => (
                                <button
                                    key={h}
                                    onClick={() => handleChange('hour', h.toString())}
                                    className={`py-1 rounded text-xs font-bold ${parseInt(hour) === h ? theme.primary : 'hover:bg-slate-50 text-slate-600'}`}
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                        {/* Minute Column */}
                        <div className="flex flex-col gap-1 h-32 overflow-y-auto custom-scrollbar p-1 border-l border-r border-slate-50">
                            <span className="text-[9px] font-bold text-slate-400 text-center uppercase mb-1">Min</span>
                            {Array.from({length: 12}, (_, i) => i * 5).map(m => {
                                const mStr = m.toString().padStart(2, '0');
                                return (
                                    <button
                                        key={m}
                                        onClick={() => handleChange('minute', mStr)}
                                        className={`py-1 rounded text-xs font-bold ${minute === mStr ? theme.primary : 'hover:bg-slate-50 text-slate-600'}`}
                                    >
                                        {mStr}
                                    </button>
                                );
                            })}
                        </div>
                        {/* Period Column */}
                        <div className="flex flex-col gap-2 p-1 justify-center">
                            <button
                                onClick={() => handleChange('period', 'AM')}
                                className={`py-2 rounded text-xs font-bold ${period === 'AM' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                AM
                            </button>
                            <button
                                onClick={() => handleChange('period', 'PM')}
                                className={`py-2 rounded text-xs font-bold ${period === 'PM' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                PM
                            </button>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className={`w-full mt-3 py-2 ${theme.accentBg} ${theme.accentText} text-xs font-bold rounded-lg`}
                    >
                        Done
                    </button>
                </div>
            )}
        </div>
    );
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
    // Poll bots for status updates
    const interval = setInterval(() => {
        store.getBots().then(setBots);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleConnection = async (type: BotType) => {
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
       onNavigate('bot-activity', { botType: bot.type });
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
            onToggle={() => handleToggleConnection(bot.type)} 
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

interface BotConfigModalProps {
  bot: BotConfig;
  onClose: () => void;
  onSave: (bot: BotConfig) => void;
}

type TabType = 'Overview' | 'Schedule' | 'Rules' | 'Safety' | 'Simulation';

const BotConfigModal: React.FC<BotConfigModalProps> = ({ bot, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [config, setConfig] = useState<BotSpecificConfig>({ ...bot.config });
  const [interval, setBotInterval] = useState(bot.intervalMinutes);
  const [safetyLevel, setSafetyLevel] = useState<'Conservative' | 'Moderate' | 'Aggressive'>(config.safetyLevel || 'Moderate');
  
  // Personality Tuning State
  const [proactiveness, setProactiveness] = useState(50);
  const [toneVal, setToneVal] = useState(50);
  const [verbosity, setVerbosity] = useState(50);
  const [topicsToAvoid, setTopicsToAvoid] = useState<string[]>(config.aiStrategy?.topicsToAvoid || []);

  const [simulationLogs, setSimulationLogs] = useState<BotActivity[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationPollRef = useRef<NodeJS.Timeout | null>(null);

  // Sync State for API bots
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Simulation Preview State
  const [simMode, setSimMode] = useState<string>('single');
  const [simResult, setSimResult] = useState<any>(null);
  const [logsExpanded, setLogsExpanded] = useState(false);

  // Incident Management State
  const [incidentAcknowledged, setIncidentAcknowledged] = useState(false);

  // Derive theme from active tab
  const theme = TAB_THEMES[activeTab] || TAB_THEMES.Overview;

  useEffect(() => {
      setConfig({ ...bot.config });
      setBotInterval(bot.intervalMinutes);
      setSafetyLevel(bot.config.safetyLevel || 'Moderate');
      
      // Initialize Personality sliders from existing config loosely
      if (bot.config.aiStrategy) {
          setTopicsToAvoid(bot.config.aiStrategy.topicsToAvoid || []);
          if (bot.config.aiStrategy.brandVoice === 'Professional') setToneVal(20);
          else if (bot.config.aiStrategy.brandVoice === 'Witty') setToneVal(80);
          else setToneVal(50);
      }
  }, [bot]);

  // Clean up poll on unmount
  useEffect(() => {
      return () => {
          if (simulationPollRef.current) clearInterval(simulationPollRef.current);
      };
  }, []);

  const updateConfig = (key: keyof BotSpecificConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateStrategy = (key: keyof AIStrategyConfig, value: any) => {
      setConfig(prev => ({
          ...prev,
          aiStrategy: {
              ...(prev.aiStrategy || { creativityLevel: 'Medium', brandVoice: 'Professional', keywordsToInclude: [], topicsToAvoid: [] }),
              [key]: value
          }
      }));
  };

  const toggleTopicAvoidance = (topic: string) => {
      setTopicsToAvoid(prev => {
          const next = prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic];
          updateStrategy('topicsToAvoid', next);
          return next;
      });
  };

  const handleSave = () => {
    // Validate schedule before saving
    const startMins = getMinutesFromMidnight(config.workHoursStart || '09:00');
    const endMins = getMinutesFromMidnight(config.workHoursEnd || '17:00');
    if (endMins <= startMins) {
        alert("Invalid Schedule: End time must be after start time.");
        return;
    }

    // Map personality back to strategy config
    const derivedVoice = toneVal < 30 ? 'Professional' : toneVal > 70 ? 'Witty' : 'Casual';
    const derivedCreativity = proactiveness > 60 ? 'High' : proactiveness < 40 ? 'Low' : 'Medium';

    onSave({
      ...bot,
      intervalMinutes: interval,
      config: { 
          ...config, 
          safetyLevel,
          aiStrategy: {
              ...config.aiStrategy,
              brandVoice: derivedVoice,
              creativityLevel: derivedCreativity,
              topicsToAvoid
          } as AIStrategyConfig
      },
    });
  };

  // Incident Recovery Handlers
  const handleApplyFix = (fixType: 'conservative' | 'clear') => {
      if (fixType === 'conservative') {
          setSafetyLevel('Conservative');
          setBotInterval(Math.max(120, interval)); // Force higher interval
          alert("Applied 'Conservative' settings. Please review and click Resume.");
      } else if (fixType === 'clear') {
          // This would typically be a specific API call to reset stats, here we'll mock the intent
          // Real reset happens on Save/Resume
          alert("Stats will be cleared upon resuming.");
      }
  };

  const handleResumeBot = () => {
      onSave({
          ...bot,
          enabled: true,
          status: 'Idle',
          intervalMinutes: interval,
          config: { ...config, safetyLevel },
          stats: {
              ...bot.stats,
              consecutiveErrors: 0 // Reset error counter
          }
      });
  };

  const handleForceSync = async () => {
      setIsSyncing(true);
      setSyncMessage(null);
      // Simulate API call delay
      await new Promise(r => setTimeout(r, 1500));
      setLastSyncTime(new Date());
      setIsSyncing(false);
      setSyncMessage("Rules refreshed from API");
      setTimeout(() => setSyncMessage(null), 3000);
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    setSimulationLogs([]);
    setSimResult(null); // Clear previous results
    
    // Start simulation on backend/store
    await store.simulateBot(bot.type);
    
    // Start polling for logs immediately
    fetchLogs();
    simulationPollRef.current = setInterval(fetchLogs, 800);

    // Mock Result Generation based on mode & bot type (since backend simulation is fire & forget)
    setTimeout(() => {
        generateSimulationResult();
    }, 2500); // Small delay to mimic analysis
  };

  const generateSimulationResult = () => {
      // Mock data for preview
      const multiplier = simMode === 'day' ? 20 : simMode === 'stress' ? 50 : 1;
      
      let predictedActions: any[] = [];
      let sampleContent = "";
      let safetyChecks = [
          { label: 'Rate limits respected', passed: true },
          { label: 'Spam filters passed', passed: true },
          { label: 'Platform policy safe', passed: true },
      ];

      if (bot.type === BotType.Engagement) {
          predictedActions = [
              { label: 'Reply to mentions', count: 5 * multiplier },
              { label: 'Like posts', count: 12 * multiplier }
          ];
          sampleContent = "Reply Draft:\n> \"Thanks for sharing this insight on AI automation — totally agree with your point about scalability!\"";
      } else if (bot.type === BotType.Finder) {
          predictedActions = [
              { label: 'Track keywords', count: 4 * multiplier },
              { label: 'Draft replies', count: 2 * multiplier }
          ];
          sampleContent = "Found Lead:\n> User: @tech_guru\n> Context: Looking for social automation tools.\n> Sentiment: High Interest";
      } else if (bot.type === BotType.Growth) {
          predictedActions = [
              { label: 'Follow accounts', count: 10 * multiplier },
              { label: 'Unfollow inactive', count: 4 * multiplier }
          ];
          sampleContent = "Action Log:\n> Followed @marketing_pro (Score: 85% match)\n> Skipped @bot_user_123 (Low quality score)";
      }

      // Simulate failure for stress test
      if (simMode === 'stress') {
          safetyChecks.push({ label: 'Burst limit check', passed: false });
      }

      setSimResult({
          predictedActions,
          sampleContent,
          safetyChecks
      });
  };

  const fetchLogs = async () => {
      const logs = await store.getBotActivity(bot.type);
      setSimulationLogs(logs.slice(0, 10));
      
      if (logs.length > 0) {
          const latest = logs[0];
          if (latest.status === ActivityStatus.SUCCESS || latest.status === ActivityStatus.FAILED) {
              setIsSimulating(false);
              if (simulationPollRef.current) clearInterval(simulationPollRef.current);
          }
      }
  };

  // Preview Text Logic
  const getPersonalityPreview = () => {
      const baseText = "AI regulation is crucial for sustainable growth.";
      let preview = baseText;
      
      if (toneVal > 70) preview = "AI regulation is super key for keeping things chill and growing 🌱🚀";
      else if (toneVal < 30) preview = "Strict adherence to AI regulation protocols is paramount for ensuring long-term sectoral stability.";
      
      if (verbosity > 70) preview += " We must prioritize safety frameworks to mitigate risks while fostering innovation.";
      else if (verbosity < 30) preview = toneVal > 70 ? "AI rules = Safe growth 🚀" : "Regulation ensures stability.";

      return preview;
  };

  // Advanced Schedule Logic
  const startStr = config.workHoursStart || '09:00';
  const endStr = config.workHoursEnd || '17:00';
  const startMins = getMinutesFromMidnight(startStr);
  const endMins = getMinutesFromMidnight(endStr);
  
  const isValidSchedule = endMins > startMins;
  const totalActiveMinutes = Math.max(0, endMins - startMins);
  const estimatedRuns = Math.floor(totalActiveMinutes / interval);
  
  const { hour: startH, minute: startM, period: startP } = parseTime(startStr);
  const { hour: endH, minute: endM, period: endP } = parseTime(endStr);

  const isHighFrequency = estimatedRuns > 50;
  const isReadOnlyRules = activeTab === 'Rules' && bot.type !== BotType.Creator && bot.type !== BotType.Engagement;

  const renderContent = () => {
      switch(activeTab) {
          case 'Overview':
              const isIncident = bot.status === 'Error' || bot.status === 'LimitReached';
              
              if (isIncident) {
                  const isError = bot.status === 'Error';
                  const mainColor = isError ? 'red' : 'orange';
                  const MainIcon = isError ? XOctagon : Thermometer;
                  
                  return (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          {/* Incident Header */}
                          <div className={`rounded-2xl border bg-white overflow-hidden shadow-sm border-${mainColor}-200`}>
                              <div className={`px-6 py-4 bg-${mainColor}-50 border-b border-${mainColor}-100 flex items-start gap-4`}>
                                  <div className={`p-3 rounded-full bg-white shadow-sm text-${mainColor}-600`}>
                                      <MainIcon className="w-8 h-8" />
                                  </div>
                                  <div className="flex-1">
                                      <h3 className={`text-xl font-bold text-${mainColor}-900`}>
                                          {isError ? 'Critical Failure Detected' : 'Safety Limits Exceeded'}
                                      </h3>
                                      <p className={`text-sm text-${mainColor}-800 mt-1`}>
                                          Bot auto-paused to prevent account suspension. 
                                          {isError ? " Multiple API errors detected in sequence." : " Daily interaction volume hit safety threshold."}
                                      </p>
                                      <div className="flex items-center gap-4 mt-3 text-xs font-bold uppercase tracking-wide opacity-80">
                                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Paused 24m ago</span>
                                          <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {bot.stats.consecutiveErrors} {isError ? 'Errors' : 'Flags'}</span>
                                      </div>
                                  </div>
                              </div>
                              
                              {/* Incident Timeline */}
                              <div className="p-6">
                                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Incident Timeline</h4>
                                  <div className="space-y-0 pl-2 border-l-2 border-slate-100 ml-1">
                                      {/* Mock Timeline */}
                                      <div className="relative pl-6 pb-6">
                                          <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm bg-${mainColor}-500`}></div>
                                          <div className="flex justify-between items-start">
                                              <div>
                                                  <span className="text-sm font-bold text-gray-900 block">Bot Auto-Paused</span>
                                                  <span className="text-xs text-gray-500">Safety circuit breaker triggered.</span>
                                              </div>
                                              <span className="text-xs font-mono text-gray-400">10:43 AM</span>
                                          </div>
                                      </div>
                                      <div className="relative pl-6 pb-6">
                                          <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm bg-${mainColor}-300`}></div>
                                          <div className="flex justify-between items-start">
                                              <div>
                                                  <span className="text-sm font-bold text-gray-700 block">
                                                      {isError ? 'API Error: Rate Limit Exceeded (429)' : 'Daily Action Limit Hit (50/50)'}
                                                  </span>
                                                  <span className="text-xs text-gray-500">Platform returned warning headers.</span>
                                              </div>
                                              <span className="text-xs font-mono text-gray-400">10:42 AM</span>
                                          </div>
                                      </div>
                                      <div className="relative pl-6">
                                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm bg-slate-300"></div>
                                          <div className="flex justify-between items-start">
                                              <div>
                                                  <span className="text-sm font-bold text-gray-600 block">System Healthy</span>
                                                  <span className="text-xs text-gray-500">Regular operation.</span>
                                              </div>
                                              <span className="text-xs font-mono text-gray-400">09:00 AM</span>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          {/* Recovery Actions */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                      <Wand2 className="w-4 h-4 text-blue-500" /> Recommended Fixes
                                  </h4>
                                  <div className="space-y-3">
                                      <button 
                                          onClick={() => handleApplyFix('conservative')}
                                          className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                                      >
                                          <div className="flex items-center justify-between mb-1">
                                              <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700">Switch to Conservative Mode</span>
                                              <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500" />
                                          </div>
                                          <p className="text-[10px] text-slate-500">Reduces frequency and daily limits to cool down.</p>
                                      </button>
                                      <button 
                                          onClick={() => handleApplyFix('clear')}
                                          className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                                      >
                                          <div className="flex items-center justify-between mb-1">
                                              <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700">Clear Error Stats</span>
                                              <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500" />
                                          </div>
                                          <p className="text-[10px] text-slate-500">Manually reset counters if false positive.</p>
                                      </button>
                                  </div>
                              </div>

                              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col">
                                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                      <Play className="w-4 h-4 text-green-600" /> Resume Operations
                                  </h4>
                                  <div className="flex-1 flex flex-col justify-end space-y-4">
                                      <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                                          <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${incidentAcknowledged ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                                              <input 
                                                  type="checkbox" 
                                                  checked={incidentAcknowledged}
                                                  onChange={(e) => setIncidentAcknowledged(e.target.checked)}
                                                  className="hidden"
                                              />
                                              {incidentAcknowledged && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                          </div>
                                          <span className="text-xs text-slate-600 font-medium">
                                              I acknowledge the risk and have reviewed the safety settings.
                                          </span>
                                      </label>
                                      <button 
                                          onClick={handleResumeBot}
                                          disabled={!incidentAcknowledged}
                                          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:shadow-none disabled:bg-slate-300 transition-all"
                                      >
                                          Resume with Safe Settings
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  );
              }

              return (
                  <div className="space-y-6">
                      {/* Hero Status Card */}
                      <div className={`bg-white p-6 rounded-2xl border ${theme.border} flex items-center gap-6 shadow-sm relative overflow-hidden`}>
                           <div className="relative z-10">
                               {bot.enabled && <div className="absolute inset-0 bg-blue-500 rounded-2xl animate-ping opacity-20"></div>}
                               <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md ${bot.enabled ? 'bg-blue-500' : 'bg-slate-300'}`}>
                                    {bot.enabled ? 'ON' : 'OFF'}
                               </div>
                           </div>
                           <div className="flex-1 z-10">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-slate-900 text-lg">{bot.type}</h3>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${bot.status === 'Running' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                        {bot.status}
                                    </span>
                                </div>
                                <p className="text-slate-500 text-sm">
                                    {bot.enabled 
                                        ? "Bot is currently active and monitoring for tasks." 
                                        : "Bot is disabled. Enable it to resume automation."}
                                </p>
                           </div>
                           <div className={`text-right ${theme.accentBg} px-4 py-2 rounded-xl border ${theme.border}`}>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Last Run</p>
                               <p className="text-sm font-bold text-slate-700 font-mono">{bot.lastRun ? new Date(bot.lastRun).toLocaleTimeString() : 'Never'}</p>
                           </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {/* Efficiency Metric */}
                           <div className={`p-5 border ${theme.border} bg-white rounded-2xl shadow-sm`}>
                               <div className="flex justify-between items-start mb-2">
                                   <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Usage Efficiency</div>
                                   <BarChart3 className={`w-4 h-4 ${theme.icon}`} />
                               </div>
                               <div className="text-2xl font-bold text-slate-900 mt-1">
                                   {Math.round((bot.stats.currentDailyActions / bot.stats.maxDailyActions) * 100)}%
                               </div>
                               <p className="text-xs text-slate-500 mt-1">of daily capacity used.</p>
                               <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                                   <div className={`h-full rounded-full transition-all ${bot.stats.currentDailyActions >= bot.stats.maxDailyActions ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: `${(bot.stats.currentDailyActions / bot.stats.maxDailyActions)*100}%` }}></div>
                               </div>
                           </div>
                           
                           {/* Health Check */}
                           <div className={`p-5 border ${theme.border} bg-white rounded-2xl shadow-sm`}>
                               <div className="flex justify-between items-start mb-2">
                                   <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">System Health</div>
                                   <Activity className={`w-4 h-4 ${theme.icon}`} />
                               </div>
                               <div className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
                                   {bot.stats.consecutiveErrors === 0 ? 'Healthy' : 'Attention Needed'}
                               </div>
                               <div className="mt-3 flex items-center gap-2 text-xs font-medium">
                                   {bot.stats.consecutiveErrors === 0 ? (
                                       <span className="text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> No recent errors</span>
                                   ) : (
                                       <span className="text-orange-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {bot.stats.consecutiveErrors} consecutive errors</span>
                                   )}
                               </div>
                           </div>
                      </div>

                      <div className={`${theme.accentBg} p-4 rounded-xl border ${theme.border} text-sm text-slate-600 leading-relaxed flex items-start gap-3`}>
                          <Info className={`w-5 h-5 ${theme.icon} shrink-0 mt-0.5`} />
                          <div>
                              <strong className={`block ${theme.accentText} mb-1`}>About this Bot</strong>
                              {BOT_DESCRIPTIONS[bot.type]}
                          </div>
                      </div>
                  </div>
              );
          
          case 'Schedule':
              return (
                  <div className="space-y-8 animate-in fade-in duration-300">
                      {/* Interval Slider */}
                      <div className={`bg-white p-6 rounded-2xl border ${theme.border} shadow-sm`}>
                          <div className="flex items-center gap-2 mb-6">
                              <Clock className={`w-4 h-4 ${theme.icon}`} />
                              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Frequency</h3>
                          </div>
                          
                          <div className="flex justify-between items-center mb-6">
                              <div>
                                  <label className="text-sm font-bold text-slate-900 block">Wake Interval</label>
                                  <p className="text-xs text-slate-500 mt-1">How often the bot checks for new tasks.</p>
                              </div>
                              <span className={`text-sm font-bold ${theme.accentBg} px-3 py-1.5 rounded-lg border ${theme.border} ${theme.accentText}`}>Every {interval} mins</span>
                          </div>
                          <div className="flex items-center gap-4">
                              <span className="text-xs font-bold text-slate-400 w-10 text-center">10m</span>
                              <input 
                                type="range" 
                                min="10" 
                                max="240" 
                                step="10" 
                                value={interval} 
                                onChange={(e) => setBotInterval(parseInt(e.target.value))}
                                className="flex-1 accent-blue-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                              />
                              <span className="text-xs font-bold text-slate-400 w-10 text-center">4h</span>
                          </div>
                      </div>

                      {/* Work Hours */}
                      <div>
                          <div className="flex items-center gap-2 mb-4">
                              <Calendar className={`w-4 h-4 ${theme.icon}`} />
                              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Working Window</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-6 mb-4">
                              <TimePickerInput 
                                  label="Start Time" 
                                  value={config.workHoursStart || '09:00'} 
                                  onChange={(v) => updateConfig('workHoursStart', v)} 
                                  theme={theme}
                              />
                              <TimePickerInput 
                                  label="End Time" 
                                  value={config.workHoursEnd || '17:00'} 
                                  onChange={(v) => updateConfig('workHoursEnd', v)} 
                                  hasError={!isValidSchedule}
                                  theme={theme}
                              />
                          </div>
                          
                          {!isValidSchedule && (
                              <div className="mb-4 text-xs font-bold text-red-500 flex items-center gap-2 animate-in slide-in-from-top-1">
                                  <AlertOctagon className="w-3 h-3" /> End time must be after start time.
                              </div>
                          )}
                          
                          <div className={`border rounded-xl p-4 flex gap-4 shadow-sm transition-colors ${!isValidSchedule ? 'bg-red-50 border-red-100 opacity-50' : isHighFrequency ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-200'}`}>
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold shadow-sm border ${!isValidSchedule ? 'bg-white text-red-500 border-red-200' : isHighFrequency ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white text-slate-700 border-slate-200'}`}>
                                  {!isValidSchedule ? <X className="w-5 h-5" /> : isHighFrequency ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                              </div>
                              <div>
                                  <h4 className={`text-xs font-bold uppercase tracking-wide ${!isValidSchedule ? 'text-red-800' : isHighFrequency ? 'text-amber-900' : 'text-slate-500'}`}>
                                      {isValidSchedule ? 'Estimated Cycles' : 'Invalid Configuration'}
                                  </h4>
                                  <p className={`text-sm mt-1 leading-relaxed ${!isValidSchedule ? 'text-red-600' : isHighFrequency ? 'text-amber-800' : 'text-slate-600'}`}>
                                      {isValidSchedule ? (
                                          <>
                                            Based on these settings, the bot will wake up <strong>{estimatedRuns} times daily</strong> between <strong>{startH}:{startM} {startP} – {endH}:{endM} {endP}</strong>.
                                            {isHighFrequency && " High frequency may trigger platform rate limits. Consider increasing the interval."}
                                          </>
                                      ) : (
                                          "Please correct the start and end times to enable automation."
                                      )}
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>
              );
              
          case 'Safety':
              const currentModeInfo = SAFETY_LEVELS[safetyLevel];
              const riskPercentage = safetyLevel === 'Conservative' ? 25 : safetyLevel === 'Moderate' ? 50 : 85;
              const riskColor = safetyLevel === 'Conservative' ? 'bg-emerald-500' : safetyLevel === 'Moderate' ? 'bg-blue-500' : 'bg-orange-500';

              return (
                  <div className="space-y-8 animate-in fade-in duration-300">
                      {/* Risk Meter Section */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
                          <div className="flex justify-between items-end mb-3">
                              <div>
                                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                      <Activity className="w-4 h-4 text-slate-500" /> Estimated Risk Profile
                                  </h3>
                                  <p className="text-xs text-slate-500 mt-1 font-medium">Based on current configuration limits and frequency.</p>
                              </div>
                              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${currentModeInfo.color.replace('bg-', 'bg-white text-').replace('text-', 'text-').replace('border-', 'border-')}`}>
                                  {safetyLevel} Risk
                              </span>
                          </div>
                          <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                              <div className={`h-full ${riskColor} transition-all duration-700 ease-out`} style={{ width: `${riskPercentage}%` }}></div>
                          </div>
                          <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              <span>Low Risk (Safe)</span>
                              <span>Moderate</span>
                              <span className="text-orange-400">High Risk (Attention)</span>
                          </div>
                      </div>

                      {/* Mode Selection Cards */}
                      <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                              <Shield className={`w-4 h-4 ${theme.icon}`} />
                              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Operation Mode</h3>
                          </div>
                          
                          {['Conservative', 'Moderate', 'Aggressive'].map((level: any) => {
                              const info = SAFETY_LEVELS[level as keyof typeof SAFETY_LEVELS];
                              const Icon = info.icon;
                              const isSelected = safetyLevel === level;
                              return (
                                  <button 
                                    key={level}
                                    onClick={() => setSafetyLevel(level)}
                                    className={`w-full text-left relative overflow-hidden transition-all duration-200 group
                                        ${isSelected ? 'ring-2 ring-amber-500 shadow-md transform scale-[1.01] bg-white border-transparent z-10' : 'bg-white hover:bg-slate-50 border border-slate-200'}
                                        rounded-2xl
                                    `}
                                  >
                                      <div className="p-5 flex items-start gap-4">
                                          <div className={`p-3 rounded-xl shrink-0 ${info.color}`}>
                                              <Icon className="w-6 h-6" />
                                          </div>
                                          <div className="flex-1">
                                              <div className="flex justify-between items-center mb-1">
                                                  <h4 className="font-bold text-slate-900 text-base">{info.label}</h4>
                                                  {isSelected && <CheckCircle className="w-5 h-5 text-amber-600" />}
                                              </div>
                                              <p className="text-sm text-slate-500 font-medium mb-3">{info.desc}</p>
                                              
                                              {/* Granular Details Grid */}
                                              <div className={`grid grid-cols-2 gap-2 mt-3 ${isSelected ? 'opacity-100' : 'opacity-60'}`}>
                                                  <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Daily Limit</span>
                                                      <span className="text-xs font-bold text-slate-700">{info.dailyLimit}</span>
                                                  </div>
                                                  <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Execution Speed</span>
                                                      <span className="text-xs font-bold text-slate-700">{info.speed}</span>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  </button>
                              )
                          })}
                      </div>

                      {/* Bot Specific Safety Policy */}
                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                           <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                               <ShieldCheck className="w-4 h-4 text-slate-500" />
                               <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Active Policies for {bot.type}</h3>
                           </div>
                           <div className="p-5 space-y-3">
                               {bot.type === BotType.Engagement && (
                                   <>
                                      <ReadOnlyRow label="Spam Filter" value="Strict (AI)" icon={Filter} />
                                      <ReadOnlyRow label="Negative Sentiment Skip" value="Enabled" icon={Minus} />
                                      <ReadOnlyRow label="Max Replies / Hour" value={safetyLevel === 'Aggressive' ? '20' : '5'} icon={Clock} />
                                   </>
                               )}
                               {bot.type === BotType.Growth && (
                                   <>
                                      <ReadOnlyRow label="Cooldown After Action" value={safetyLevel === 'Aggressive' ? '2 min' : '15 min'} icon={Hourglass} />
                                      <ReadOnlyRow label="Competitor Protection" value="Active" icon={Shield} />
                                      <ReadOnlyRow label="Unfollow Threshold" value="< 100 / day" icon={UserPlus} />
                                   </>
                               )}
                               {bot.type === BotType.Creator && (
                                   <>
                                      <ReadOnlyRow label="Content Safety Check" value="Gemini Core" icon={BrainCircuit} />
                                      <ReadOnlyRow label="Duplicate Prevention" value="Enabled" icon={Copy} />
                                   </>
                               )}
                               {bot.type === BotType.Finder && (
                                   <div className="text-center py-4 text-xs text-slate-400 italic">No specific safety constraints for passive monitoring.</div>
                               )}
                           </div>
                      </div>

                      {/* Fail-Safe Section */}
                      <div className="border-t border-slate-100 pt-6">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Lock className="w-4 h-4" /> Fail-Safe Protocol
                          </h4>
                          <div className={`flex items-start gap-4 p-4 ${theme.accentBg} rounded-xl border ${theme.border}`}>
                              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 text-amber-600 shadow-sm">
                                  <PauseCircle className="w-6 h-6" />
                              </div>
                              <div>
                                  <span className={`block text-sm font-bold ${theme.accentText} mb-1`}>Auto-Pause Conditions</span>
                                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside marker:text-amber-400">
                                      <li><strong>5 consecutive API errors</strong> occur within 10 minutes.</li>
                                      <li>Platform rate-limit headers are detected.</li>
                                      <li>Unusual account activity verification challenge.</li>
                                  </ul>
                                  <div className="mt-3 text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                      <History className="w-3 h-3" /> Last Trigger: None
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              );
              
          case 'Rules':
              return (
                  <div className="space-y-6">
                      {/* Interactive Personality Tuning for Creator/Engagement */}
                      {(bot.type === BotType.Creator || bot.type === BotType.Engagement) ? (
                          <div className="flex flex-col md:flex-row gap-6 h-full">
                              {/* Controls Column */}
                              <div className="flex-1 space-y-6">
                                  {/* Personality Engine Section */}
                                  <div className={`bg-white p-6 rounded-2xl border ${theme.border} shadow-sm`}>
                                      <div className="flex items-center gap-2 mb-6">
                                          <SlidersHorizontal className={`w-4 h-4 ${theme.icon}`} />
                                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Personality Engine</h3>
                                      </div>

                                      <div className="space-y-6">
                                          {/* Proactiveness Slider */}
                                          <div>
                                              <div className="flex justify-between items-center mb-2">
                                                  <label className="text-sm font-bold text-slate-900">Proactiveness</label>
                                                  <span className="text-xs text-slate-500 font-medium">
                                                      {proactiveness < 30 ? 'Reactive' : proactiveness > 70 ? 'High Initiative' : 'Balanced'}
                                                  </span>
                                              </div>
                                              <input 
                                                  type="range" min="0" max="100" value={proactiveness}
                                                  onChange={(e) => setProactiveness(parseInt(e.target.value))}
                                                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                              />
                                              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mt-1">
                                                  <span>Conservative</span>
                                                  <span>Proactive</span>
                                              </div>
                                          </div>

                                          {/* Tone Slider */}
                                          <div>
                                              <div className="flex justify-between items-center mb-2">
                                                  <label className="text-sm font-bold text-slate-900">Tone</label>
                                                  <span className="text-xs text-slate-500 font-medium">
                                                      {toneVal < 30 ? 'Professional' : toneVal > 70 ? 'Casual & Witty' : 'Neutral'}
                                                  </span>
                                              </div>
                                              <input 
                                                  type="range" min="0" max="100" value={toneVal}
                                                  onChange={(e) => setToneVal(parseInt(e.target.value))}
                                                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                              />
                                              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mt-1">
                                                  <span>Formal</span>
                                                  <span>Casual</span>
                                              </div>
                                          </div>

                                          {/* Verbosity Slider */}
                                          <div>
                                              <div className="flex justify-between items-center mb-2">
                                                  <label className="text-sm font-bold text-slate-900">Verbosity</label>
                                                  <span className="text-xs text-slate-500 font-medium">
                                                      {verbosity < 30 ? 'Concise' : verbosity > 70 ? 'Detailed' : 'Standard'}
                                                  </span>
                                              </div>
                                              <input 
                                                  type="range" min="0" max="100" value={verbosity}
                                                  onChange={(e) => setVerbosity(parseInt(e.target.value))}
                                                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                                              />
                                              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mt-1">
                                                  <span>Brief</span>
                                                  <span>Detailed</span>
                                              </div>
                                          </div>
                                      </div>
                                  </div>

                                  {/* Risk Appetite */}
                                  <div className={`bg-white p-6 rounded-2xl border ${theme.border} shadow-sm`}>
                                      <div className="flex items-center gap-2 mb-4">
                                          <Gauge className={`w-4 h-4 ${theme.icon}`} />
                                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Appetite</h3>
                                      </div>
                                      <div className="flex bg-slate-100 p-1 rounded-xl">
                                          {['Conservative', 'Moderate', 'Aggressive'].map((mode) => (
                                              <button
                                                  key={mode}
                                                  onClick={() => setSafetyLevel(mode as any)}
                                                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                                      safetyLevel === mode 
                                                      ? 'bg-white text-slate-900 shadow-sm' 
                                                      : 'text-slate-500 hover:text-slate-700'
                                                  }`}
                                              >
                                                  {mode}
                                              </button>
                                          ))}
                                      </div>
                                      <div className="mt-3 text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                          {safetyLevel === 'Conservative' && "Prioritizes account safety. Low frequency, strict filters."}
                                          {safetyLevel === 'Moderate' && "Balanced approach. Standard frequency and content checks."}
                                          {safetyLevel === 'Aggressive' && "Maximizes growth. High frequency, relaxed filters. Higher risk."}
                                      </div>
                                  </div>

                                  {/* Topic Sensitivity */}
                                  <div className={`bg-white p-6 rounded-2xl border ${theme.border} shadow-sm`}>
                                      <div className="flex items-center gap-2 mb-4">
                                          <ShieldAlert className={`w-4 h-4 ${theme.icon}`} />
                                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Topic Sensitivity</h3>
                                      </div>
                                      <div className="space-y-3">
                                          {['Politics', 'Religion', 'Controversial News', 'Competitor Mentions'].map(topic => (
                                              <label key={topic} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                                                  <span className="text-sm font-medium text-slate-700">Avoid {topic}</span>
                                                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${topicsToAvoid.includes(topic) ? 'bg-red-500 border-red-500' : 'bg-white border-slate-300'}`}>
                                                      <input 
                                                          type="checkbox" 
                                                          className="hidden"
                                                          checked={topicsToAvoid.includes(topic)}
                                                          onChange={() => toggleTopicAvoidance(topic)}
                                                      />
                                                      {topicsToAvoid.includes(topic) && <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                                  </div>
                                              </label>
                                          ))}
                                      </div>
                                  </div>
                              </div>

                              {/* Preview Column */}
                              <div className="w-full md:w-80 flex flex-col gap-4">
                                  <div className="bg-gradient-to-b from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 shadow-sm sticky top-0">
                                      <div className="flex items-center gap-2 mb-4 text-indigo-900">
                                          <Sparkles className="w-4 h-4" />
                                          <h4 className="text-xs font-bold uppercase tracking-wider">Live Behavior Preview</h4>
                                      </div>
                                      
                                      <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-50/50 relative">
                                          <div className="absolute -top-2 -left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                              AI Draft
                                          </div>
                                          <div className="flex gap-3 mb-3">
                                              <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                                              <div>
                                                  <div className="h-2 w-20 bg-slate-200 rounded mb-1"></div>
                                                  <div className="h-2 w-12 bg-slate-100 rounded"></div>
                                              </div>
                                          </div>
                                          <p className="text-sm text-slate-800 leading-relaxed font-medium">
                                              {getPersonalityPreview()}
                                          </p>
                                          <div className="mt-3 flex gap-2">
                                              <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
                                              <div className="h-6 w-12 bg-slate-100 rounded-full"></div>
                                          </div>
                                      </div>

                                      <div className="mt-6 space-y-2">
                                          <div className="flex justify-between text-xs">
                                              <span className="text-indigo-800/60 font-medium">Est. Reply Rate</span>
                                              <span className="font-bold text-indigo-900">
                                                  {safetyLevel === 'Aggressive' ? 'High (~15/hr)' : safetyLevel === 'Moderate' ? 'Medium (~5/hr)' : 'Low (~1/hr)'}
                                              </span>
                                          </div>
                                          <div className="flex justify-between text-xs">
                                              <span className="text-indigo-800/60 font-medium">Content Variety</span>
                                              <span className="font-bold text-indigo-900">
                                                  {proactiveness > 70 ? 'High' : 'Standard'}
                                              </span>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ) : (
                          // Non-Creator Bots - Read Only View
                          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                              
                              {/* 1. API Governance Banner */}
                              <div className={`p-4 rounded-xl border ${theme.border} ${theme.accentBg} flex items-start gap-3`}>
                                  <div className={`p-2 bg-white rounded-lg border ${theme.border} shrink-0`}>
                                      <Server className={`w-5 h-5 ${theme.icon}`} />
                                  </div>
                                  <div className="flex-1">
                                      <h4 className={`text-sm font-bold ${theme.accentText} uppercase tracking-wide mb-1`}>
                                          Managed via API
                                      </h4>
                                      <p className="text-xs text-slate-600 leading-relaxed">
                                          The logic for <strong>{bot.type}</strong> is controlled by your external backend configuration. 
                                          The settings below are a read-only snapshot of the active rule set.
                                      </p>
                                  </div>
                              </div>

                              {/* 2. Configuration Snapshot */}
                              <div>
                                  <div className={`bg-white rounded-2xl border ${theme.border} shadow-sm overflow-hidden`}>
                                      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                              <Bot className="w-4 h-4 text-slate-400" />
                                              Active Configuration
                                          </h3>
                                          <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded border border-slate-200 uppercase flex items-center gap-1">
                                              <Lock className="w-3 h-3" /> Read-Only
                                          </span>
                                      </div>
                                      <div className="p-6">
                                          {bot.type === BotType.Finder && (
                                              <div className="space-y-1">
                                                  <ReadOnlyRow label="Tracked Keywords" value={config.trackKeywords?.length ? `${config.trackKeywords.length} Active` : 'None'} icon={Search} />
                                                  <ReadOnlyRow label="Monitored Accounts" value={config.trackAccounts?.length ? `${config.trackAccounts.length} Accounts` : 'None'} icon={Users} />
                                                  <ReadOnlyRow label="Action on Find" value={config.autoSaveToDrafts ? 'Auto-Draft' : 'Notify Only'} icon={Zap} />
                                                  <div className="mt-3 pt-3 border-t border-slate-100">
                                                      <p className="text-xs font-bold text-slate-400 mb-2">Active Keywords</p>
                                                      <div className="flex flex-wrap gap-1">
                                                          {config.trackKeywords?.map(k => (
                                                              <span key={k} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded border border-slate-200 flex items-center gap-1">
                                                                  {k} <Lock className="w-2.5 h-2.5 opacity-30" />
                                                              </span>
                                                          )) || <span className="text-xs text-slate-400 italic">No keywords configured</span>}
                                                      </div>
                                                  </div>
                                              </div>
                                          )}
                                          {bot.type === BotType.Growth && (
                                              <div className="space-y-1">
                                                  <ReadOnlyRow label="Growth Strategy" value="Safe Follow/Unfollow" icon={TrendingUp} />
                                                  <ReadOnlyRow label="Competitor Interaction" value={config.interactWithCompetitors ? 'Enabled' : 'Disabled'} icon={Target} />
                                                  <ReadOnlyRow label="Unfollow Cycle" value={`After ${config.unfollowAfterDays || 7} Days`} icon={RotateCcw} />
                                                  <ReadOnlyRow label="Target Tags" value={config.growthTags?.join(', ') || 'None'} icon={Hash} />
                                              </div>
                                          )}
                                      </div>
                                  </div>
                                  <div className="mt-2 px-2 flex gap-2 text-xs text-slate-500">
                                      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                      <p>{BOT_CONTEXT_GUIDANCE[bot.type]}</p>
                                  </div>
                              </div>

                              {/* 3. API Status & CTA */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className={`p-4 bg-white rounded-2xl border ${theme.border} shadow-sm`}>
                                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">API Health</h4>
                                      <div className="flex items-center gap-2 mb-2">
                                          <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-blue-500 animate-ping' : 'bg-green-500'}`}></div>
                                          <span className="text-sm font-bold text-slate-700">Connected</span>
                                      </div>
                                      <div className="text-xs text-slate-500 mb-3">
                                          Last rule sync: <span className="font-mono text-slate-700">{lastSyncTime.toLocaleTimeString()}</span>
                                      </div>
                                      
                                      {syncMessage ? (
                                          <div className="text-xs font-bold text-green-600 flex items-center gap-1 animate-in fade-in">
                                              <Check className="w-3 h-3" /> {syncMessage}
                                          </div>
                                      ) : (
                                          <button 
                                              onClick={handleForceSync}
                                              disabled={isSyncing}
                                              className={`text-xs font-bold ${theme.accentText} flex items-center gap-1 hover:underline disabled:opacity-50`}
                                          >
                                              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} /> 
                                              {isSyncing ? 'Syncing...' : 'Force Sync'}
                                          </button>
                                      )}
                                  </div>

                                  <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg relative overflow-hidden group cursor-pointer">
                                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-white/20 transition-all"></div>
                                      <h4 className="text-sm font-bold mb-1 relative z-10">Advanced Controls</h4>
                                      <p className="text-xs text-slate-400 mb-3 relative z-10">
                                          Want to edit these rules in the UI?
                                      </p>
                                      <div className="flex items-center gap-2 text-xs font-bold text-white/90 border border-white/20 rounded-lg px-3 py-1.5 w-fit hover:bg-white/10 transition-colors relative z-10">
                                          Unlock UI Editor <Lock className="w-3 h-3" />
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
              );
              
          case 'Simulation':
              return (
                  <div className="space-y-6 h-full flex flex-col">
                      <div className="bg-[#1d1d1f] text-white p-6 rounded-2xl shadow-xl relative overflow-hidden flex-shrink-0">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                          <div className="relative z-10">
                              <div className="flex justify-between items-start mb-6">
                                  <div>
                                      <h3 className="font-bold text-lg mb-1 tracking-tight">Behavior Preview</h3>
                                      <p className="text-slate-400 text-sm font-medium">
                                          {store['isSimulation'] 
                                            ? "Run a dry-run to forecast actions and safety compliance." 
                                            : "WARNING: Production Mode enabled. Actions will be LIVE."}
                                      </p>
                                  </div>
                                  <button 
                                     onClick={runSimulation}
                                     disabled={isSimulating}
                                     className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-900/50 active:scale-95"
                                  >
                                     {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                                     {isSimulating ? 'Analyzing...' : 'Run Simulation'}
                                  </button>
                              </div>

                              <div className="grid grid-cols-3 gap-3">
                                  {SIMULATION_MODES.map((mode) => {
                                      const Icon = mode.icon;
                                      const isSelected = simMode === mode.id;
                                      return (
                                          <button
                                              key={mode.id}
                                              onClick={() => setSimMode(mode.id)}
                                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${isSelected ? 'bg-purple-500/20 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                                          >
                                              <div className={`p-2 rounded-lg ${isSelected ? 'bg-purple-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                                                  <Icon className="w-4 h-4" />
                                              </div>
                                              <div>
                                                  <div className="text-xs font-bold">{mode.label}</div>
                                                  <div className="text-[10px] opacity-70">{mode.desc}</div>
                                              </div>
                                          </button>
                                      )
                                  })}
                              </div>
                          </div>
                      </div>
                      
                      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
                          {/* Simulation Results Panel */}
                          <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar">
                              {simResult ? (
                                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                                          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                              <Zap className="w-4 h-4 text-purple-600" /> Predicted Actions
                                          </h4>
                                          <div className="grid grid-cols-2 gap-4">
                                              {simResult.predictedActions.map((action: any, idx: number) => (
                                                  <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                      <div className="text-2xl font-bold text-slate-900">{action.count}</div>
                                                      <div className="text-xs font-medium text-slate-500">{action.label}</div>
                                                  </div>
                                              ))}
                                          </div>
                                      </div>

                                      {simResult.sampleContent && (
                                          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                                              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                                  <FileText className="w-4 h-4 text-blue-600" /> Sample Output
                                              </h4>
                                              <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 italic border border-slate-100 whitespace-pre-wrap font-serif">
                                                  {simResult.sampleContent}
                                              </div>
                                              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                                                  <Info className="w-3 h-3" /> Generated preview. Final content may vary.
                                              </div>
                                          </div>
                                      )}

                                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                                          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                              <ShieldCheck className="w-4 h-4 text-green-600" /> Safety Validation
                                          </h4>
                                          <div className="space-y-2">
                                              {simResult.safetyChecks.map((check: any, idx: number) => (
                                                  <div key={idx} className="flex items-center justify-between text-sm">
                                                      <span className="text-slate-600 font-medium">{check.label}</span>
                                                      {check.passed ? (
                                                          <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">
                                                              <Check className="w-3 h-3" /> Passed
                                                          </span>
                                                      ) : (
                                                          <span className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded">
                                                              <AlertTriangle className="w-3 h-3" /> Warning
                                                          </span>
                                                      )}
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-slate-400">
                                      <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                          <Activity className="w-8 h-8 text-slate-300" />
                                      </div>
                                      <p className="font-bold text-slate-500">Ready to Forecast</p>
                                      <p className="text-sm mt-1 max-w-[200px]">Select a mode above and click Run to generate a behavior report.</p>
                                  </div>
                              )}
                          </div>

                          {/* Technical Logs Panel - Collapsible */}
                          <div className={`bg-white border ${theme.border} rounded-2xl shadow-sm flex flex-col transition-all duration-300 ${logsExpanded ? 'flex-1' : 'w-80'}`}>
                              <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setLogsExpanded(!logsExpanded)}>
                                  <div className="flex items-center gap-2">
                                      <Terminal className="w-4 h-4 text-slate-400" />
                                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Execution Logs</span>
                                  </div>
                                  {logsExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
                              </div>
                              <div className="flex-1 overflow-y-auto p-2 bg-slate-50 font-mono text-[10px] space-y-1 custom-scrollbar min-h-[300px]">
                                  {simulationLogs.length === 0 ? (
                                      <div className="text-center py-10 text-slate-400 italic">Waiting for execution...</div>
                                  ) : (
                                      simulationLogs.map((log) => (
                                          <div key={log.id} className="flex gap-2 items-start p-2 bg-white rounded border border-slate-100 shadow-sm animate-in fade-in slide-in-from-left-1">
                                              <span className={`shrink-0 w-1.5 h-1.5 rounded-full mt-1 ${
                                                  log.status === ActivityStatus.SUCCESS ? 'bg-green-500' : 
                                                  log.status === ActivityStatus.FAILED ? 'bg-red-500' :
                                                  'bg-blue-500'
                                              }`}></span>
                                              <span className="text-slate-500 shrink-0">{new Date(log.createdAt).toLocaleTimeString().split(' ')[0]}</span>
                                              <span className="text-slate-700 break-all">{log.message}</span>
                                          </div>
                                      ))
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
              );
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
       <div className="bg-white rounded-[32px] w-full max-w-5xl h-[90vh] flex overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 ring-1 ring-white/20">
           {/* Sidebar */}
          <div className="w-64 bg-slate-50 border-r border-slate-200 p-6 flex flex-col shrink-0">
             <div className="flex items-center gap-3 mb-8">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-gray-700 to-black shadow-md`}>
                   <Bot className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="font-bold text-slate-900 text-sm leading-tight">{bot.type}</h3>
                   <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Configuration</span>
                </div>
             </div>
             <nav className="space-y-1 flex-1">
                {[{ id: 'Overview', icon: Info }, { id: 'Schedule', icon: Clock }, { id: 'Rules', icon: Wand2 }, { id: 'Safety', icon: Shield }, { id: 'Simulation', icon: Play }].map((item) => (
                   <button key={item.id} onClick={() => setActiveTab(item.id as TabType)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id ? theme.sidebarActive + ' shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`}>
                      <item.icon className="w-4 h-4" strokeWidth={2.5} />
                      {item.id}
                   </button>
                ))}
             </nav>
          </div>
          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 bg-white">
             <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto h-full flex flex-col">
                   <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">{activeTab}</h2>
                   <div className="flex-1">
                       {renderContent()}
                   </div>
                </div>
             </div>
             <div className="p-6 border-t border-slate-100 bg-white/80 backdrop-blur flex justify-between items-center shrink-0 z-20">
                <button 
                    onClick={onClose} 
                    className={`px-6 py-2.5 font-bold rounded-xl transition-colors ${
                        isReadOnlyRules 
                        ? `border-2 ${theme.border.replace('border-', 'border-')} ${theme.accentText} hover:bg-slate-50` 
                        : theme.secondary
                    }`}
                >
                    {isReadOnlyRules ? 'Close' : 'Cancel'}
                </button>
                
                <div className="relative group">
                    <button 
                        onClick={handleSave} 
                        disabled={isReadOnlyRules}
                        className={`px-8 py-2.5 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 ${
                            isReadOnlyRules 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                            : `${theme.primary} hover:scale-[1.02] active:scale-[0.98]`
                        }`}
                    >
                        {isReadOnlyRules ? (
                            <>
                                <Lock className="w-4 h-4" /> No changes to save
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" /> Save Configuration
                            </>
                        )}
                    </button>
                    {isReadOnlyRules && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                            Rules are managed by API in this version.
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                        </div>
                    )}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
