
import React, { useEffect, useState, useRef } from 'react';
import { Bot, Power, Clock, Zap, Target, TrendingUp, Search, Activity, Pause, Play, ChevronRight, Settings, X, Save, Check, Shield, AlertTriangle, AlertOctagon, Hourglass, FileText, Download, Filter, Calendar, ExternalLink, BrainCircuit, Wand2, Plus, Minus, Info, RefreshCw, MessageCircle, ThumbsUp, UserPlus, Eye, Terminal, HelpCircle, CheckCircle, BarChart3, Lock, Sliders, History, ChevronDown, Hash, Users, Server, RotateCcw, ShieldCheck, PauseCircle, ShieldAlert, Copy, ChevronUp, FastForward, Gauge, Bug, XOctagon, Thermometer, ArrowRight, SlidersHorizontal, Sparkles } from 'lucide-react';
import { store } from '../services/mockStore';
import { BotConfig, BotType, Platform, BotSpecificConfig, BotLogEntry, LogLevel, AIStrategyConfig, CalendarConfig, BotActivity, ActivityStatus, FinderBotRules, GrowthBotRules, EngagementBotRules, CreatorBotRules, ActionType, GlobalPolicyConfig, OrchestrationLogEntry, BotExecutionEvent } from '../types';
import { PlatformIcon } from '../components/PlatformIcon';
import { RuleEngine } from '../services/ruleEngine';
import { getOrchestrationLogs } from '../services/orchestrationLogs';
import { subscribeToTelemetry, getExecutionEvents } from '../services/executionTelemetry';

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
    Orchestration: {
        primary: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200/50',
        secondary: 'bg-white border-rose-200 text-rose-700 hover:bg-rose-50',
        accentText: 'text-rose-700',
        accentBg: 'bg-rose-50',
        border: 'border-rose-100',
        icon: 'text-rose-500',
        ring: 'focus:ring-rose-500',
        sidebarActive: 'text-rose-700 bg-rose-50 border-rose-200'
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

// ... (Time Parsing Helpers omitted for brevity, unchanged) ...
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

// ... (Sub Components: ReadOnlyRow, TimePickerInput - unchanged) ...
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

const TimePickerInput: React.FC<any> = ({ label, value, onChange, hasError, theme }) => {
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

// --- Sub-components for Rule Panels ---

const TagInput = ({ label, tags, onChange }: { label: string, tags: string[], onChange: (tags: string[]) => void }) => {
    const [input, setInput] = useState('');
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && input.trim()) {
            onChange([...tags, input.trim()]);
            setInput('');
        }
    };
    const removeTag = (t: string) => onChange(tags.filter(tag => tag !== t));

    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</label>
            <div className="flex flex-wrap gap-2 p-2 border border-slate-200 rounded-xl bg-white min-h-[48px]">
                {tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1">
                        {tag} <button onClick={() => removeTag(tag)}><X className="w-3 h-3 text-slate-400 hover:text-red-500" /></button>
                    </span>
                ))}
                <input 
                    className="flex-1 min-w-[80px] outline-none text-sm bg-transparent"
                    placeholder="Type & Enter..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>
        </div>
    );
};

const FinderRulesPanel = ({ rules, onChange }: { rules: FinderBotRules, onChange: (r: FinderBotRules) => void }) => (
    <div className="space-y-6 animate-in fade-in">
        <TagInput 
            label="Keyword Sources" 
            tags={rules.keywordSources || []} 
            onChange={t => onChange({ ...rules, keywordSources: t })} 
        />
        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white">
            <span className="text-sm font-bold text-slate-700">Safe Sources Only</span>
            <input 
                type="checkbox" 
                checked={rules.safeSourcesOnly} 
                onChange={e => onChange({ ...rules, safeSourcesOnly: e.target.checked })} 
                className="w-5 h-5 accent-blue-600"
            />
        </div>
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Min Relevance Score: {rules.minRelevanceScore || 50}%</label>
            <input 
                type="range" min="0" max="100" value={rules.minRelevanceScore || 50} 
                onChange={e => onChange({ ...rules, minRelevanceScore: parseInt(e.target.value) })}
                className="w-full accent-purple-600"
            />
        </div>
    </div>
);

const GrowthRulesPanel = ({ rules, onChange }: { rules: GrowthBotRules, onChange: (r: GrowthBotRules) => void }) => (
    <div className="space-y-6 animate-in fade-in">
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 border border-slate-200 rounded-xl">
                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Follow Rate / Hr</label>
                <div className="text-2xl font-bold text-slate-900 mb-2">{rules.followRatePerHour}</div>
                <input 
                    type="range" min="1" max="50" value={rules.followRatePerHour} 
                    onChange={e => onChange({ ...rules, followRatePerHour: parseInt(e.target.value) })}
                    className="w-full accent-green-500"
                />
            </div>
            <div className="bg-white p-4 border border-slate-200 rounded-xl">
                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Unfollow After (Days)</label>
                <div className="text-2xl font-bold text-slate-900 mb-2">{rules.unfollowAfterDays}</div>
                <input 
                    type="range" min="1" max="30" value={rules.unfollowAfterDays} 
                    onChange={e => onChange({ ...rules, unfollowAfterDays: parseInt(e.target.value) })}
                    className="w-full accent-orange-500"
                />
            </div>
        </div>
        <TagInput 
            label="Interest Tags" 
            tags={rules.interestTags || []} 
            onChange={t => onChange({ ...rules, interestTags: t })} 
        />
        <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>Smart filtering enabled: Private accounts ignored automatically.</span>
        </div>
    </div>
);

const EngagementRulesPanel = ({ rules, onChange }: { rules: EngagementBotRules, onChange: (r: EngagementBotRules) => void }) => (
    <div className="space-y-6 animate-in fade-in">
        <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Reply Tone</label>
            <div className="grid grid-cols-4 gap-2">
                {['formal', 'casual', 'witty', 'empathetic'].map(tone => (
                    <button
                        key={tone}
                        onClick={() => onChange({ ...rules, replyTone: tone as any })}
                        className={`py-2 px-3 rounded-lg text-xs font-bold capitalize border transition-all ${
                            rules.replyTone === tone 
                            ? 'bg-blue-50 border-blue-200 text-blue-700' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        {tone}
                    </button>
                ))}
            </div>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-4">
            <div>
                <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Emoji Level</label>
                    <span className="text-xs font-bold text-slate-700">{rules.emojiLevel}%</span>
                </div>
                <input 
                    type="range" min="0" max="100" value={rules.emojiLevel} 
                    onChange={e => onChange({ ...rules, emojiLevel: parseInt(e.target.value) })}
                    className="w-full accent-yellow-500"
                />
            </div>
            <div>
                <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Max Replies / Hr</label>
                    <span className="text-xs font-bold text-slate-700">{rules.maxRepliesPerHour}</span>
                </div>
                <input 
                    type="range" min="1" max="20" value={rules.maxRepliesPerHour} 
                    onChange={e => onChange({ ...rules, maxRepliesPerHour: parseInt(e.target.value) })}
                    className="w-full accent-blue-600"
                />
            </div>
        </div>
    </div>
);

const CreatorRulesPanel = ({ rules, onChange }: { rules: CreatorBotRules, onChange: (r: CreatorBotRules) => void }) => (
    <div className="space-y-6 animate-in fade-in">
        <div className="bg-white p-5 border border-slate-200 rounded-xl space-y-5">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-purple-600" /> Personality Engine
            </h4>
            {['proactiveness', 'tone', 'verbosity'].map(trait => (
                <div key={trait}>
                    <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-slate-500 uppercase capitalize">{trait}</label>
                        <span className="text-xs font-bold text-slate-700">{(rules.personality as any)[trait]}%</span>
                    </div>
                    <input 
                        type="range" min="0" max="100" value={(rules.personality as any)[trait]} 
                        onChange={e => onChange({ 
                            ...rules, 
                            personality: { ...rules.personality, [trait]: parseInt(e.target.value) } 
                        })}
                        className="w-full accent-purple-600"
                    />
                </div>
            ))}
        </div>
        
        <TagInput 
            label="Blocked Topics (Safety)" 
            tags={rules.topicBlocks || []} 
            onChange={t => onChange({ ...rules, topicBlocks: t })} 
        />
        
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
            <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">Risk Level</span>
            </div>
            <select 
                value={rules.riskLevel}
                onChange={e => onChange({ ...rules, riskLevel: e.target.value as any })}
                className="bg-white border border-red-200 text-red-700 text-sm font-bold rounded-lg px-3 py-1 focus:ring-red-500"
            >
                <option value="low">Low (Safe)</option>
                <option value="medium">Medium</option>
                <option value="high">High (Viral)</option>
            </select>
        </div>
    </div>
);

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

type TabType = 'Overview' | 'Schedule' | 'Rules' | 'Safety' | 'Orchestration' | 'Simulation';

const BotConfigModal: React.FC<BotConfigModalProps> = ({ bot, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [config, setConfig] = useState<BotSpecificConfig>({ ...bot.config });
  const [interval, setBotInterval] = useState(bot.intervalMinutes);
  const [safetyLevel, setSafetyLevel] = useState<'Conservative' | 'Moderate' | 'Aggressive'>(config.safetyLevel || 'Moderate');
  
  // Local state for Rules to allow editing before save
  const [rules, setRules] = useState<any>(config.rules || {});

  const [simulationLogs, setSimulationLogs] = useState<BotActivity[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationPollRef = useRef<any>(null);

  // Sync State for API bots
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Simulation Preview State
  const [simMode, setSimMode] = useState<string>('single');
  const [simResult, setSimResult] = useState<any>(null);
  const [logsExpanded, setLogsExpanded] = useState(false);

  // Orchestration State
  const [globalPolicy, setGlobalPolicy] = useState<GlobalPolicyConfig>(store.getGlobalPolicy());
  const [dailyActions, setDailyActions] = useState(store.getDailyGlobalActions());
  const [orchestrationLogs, setOrchestrationLogs] = useState<OrchestrationLogEntry[]>([]);
  
  // Phase 7: Live Execution Feed State
  const [liveEvents, setLiveEvents] = useState<BotExecutionEvent[]>([]);

  // Incident Management State
  const [incidentAcknowledged, setIncidentAcknowledged] = useState(false);

  // Derive theme from active tab
  const theme = TAB_THEMES[activeTab] || TAB_THEMES.Overview;

  useEffect(() => {
      setConfig({ ...bot.config });
      setBotInterval(bot.intervalMinutes);
      setSafetyLevel(bot.config.safetyLevel || 'Moderate');
      setRules(bot.config.rules || {});
  }, [bot]);

  // Load Orchestration Data on tab switch
  useEffect(() => {
      if (activeTab === 'Orchestration') {
          setGlobalPolicy(store.getGlobalPolicy());
          setDailyActions(store.getDailyGlobalActions());
          setOrchestrationLogs(getOrchestrationLogs());
          setLiveEvents(getExecutionEvents());
          
          // Subscribe to live telemetry
          const unsubscribe = subscribeToTelemetry((events) => {
              setLiveEvents([...events]); // Trigger re-render with new array reference
              setDailyActions({...store.getDailyGlobalActions()}); // Update gauges
          });
          
          return () => unsubscribe();
      }
  }, [activeTab]);

  // Clean up poll on unmount
  useEffect(() => {
      return () => {
          if (simulationPollRef.current) clearInterval(simulationPollRef.current);
      };
  }, []);

  const updateConfig = (key: keyof BotSpecificConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Validate schedule before saving
    const startMins = getMinutesFromMidnight(config.workHoursStart || '09:00');
    const endMins = getMinutesFromMidnight(config.workHoursEnd || '17:00');
    if (endMins <= startMins) {
        alert("Invalid Schedule: End time must be after start time.");
        return;
    }

    onSave({
      ...bot,
      intervalMinutes: interval,
      config: { 
          ...config, 
          safetyLevel,
          rules, // Include updated rules
      },
    });
  };

  const toggleEmergencyStop = () => {
      const newState = !globalPolicy.emergencyStop;
      store.updateGlobalPolicy({ emergencyStop: newState });
      setGlobalPolicy({ ...globalPolicy, emergencyStop: newState });
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

      // New: Creative Optimization Insights
      let optimizationInsight = null;

      if (bot.type === BotType.Creator) {
          predictedActions = [
              { label: 'Drafts Created', count: 1 * multiplier },
              { label: 'Scheduled Posts', count: 1 * multiplier }
          ];
          sampleContent = "Draft:\n> \"Excited to announce our latest breakthrough in AI efficiency! #Tech #Growth\"";
          optimizationInsight = {
              selected: "Product_Launch_Teaser.mp4",
              score: 85,
              reason: "High historical engagement (Top 10%)"
          };
      } else if (bot.type === BotType.Engagement) {
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
          safetyChecks,
          optimizationInsight
      });
  };

  const fetchLogs = async () => {
      const logs = await store.getBotActivity(bot.type);
      setSimulationLogs(logs.slice(0, 10));
      
      if (logs.length > 0) {
          const latest = logs[0];
          if (latest.status === ActivityStatus.SUCCESS || latest.status === ActivityStatus.FAILED || latest.status === ActivityStatus.SKIPPED) {
              setIsSimulating(false);
              if (simulationPollRef.current) clearInterval(simulationPollRef.current);
          }
      }
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
  
  // Rules Rendering Logic
  const renderRulesTab = () => {
      if (bot.type === BotType.Finder) return <FinderRulesPanel rules={rules} onChange={setRules} />;
      if (bot.type === BotType.Growth) return <GrowthRulesPanel rules={rules} onChange={setRules} />;
      if (bot.type === BotType.Engagement) return <EngagementRulesPanel rules={rules} onChange={setRules} />;
      if (bot.type === BotType.Creator) return <CreatorRulesPanel rules={rules} onChange={setRules} />;
      return <div className="text-slate-400 p-8 text-center">No configurable rules for this bot type.</div>;
  };

  const renderContent = () => {
      switch(activeTab) {
          case 'Overview':
              // ... (unchanged)
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
              // ... (unchanged)
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
                                type="range" min="10" max="240" step="10" value={interval} 
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
                              <TimePickerInput label="Start Time" value={config.workHoursStart || '09:00'} onChange={(v: string) => updateConfig('workHoursStart', v)} theme={theme} />
                              <TimePickerInput label="End Time" value={config.workHoursEnd || '17:00'} onChange={(v: string) => updateConfig('workHoursEnd', v)} hasError={!isValidSchedule} theme={theme} />
                          </div>
                          {!isValidSchedule && <div className="mb-4 text-xs font-bold text-red-500 flex items-center gap-2 animate-in slide-in-from-top-1"><AlertOctagon className="w-3 h-3" /> End time must be after start time.</div>}
                      </div>
                  </div>
              );
              
          case 'Safety':
              // ... (unchanged)
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
                  </div>
              );
              
          case 'Rules':
              return (
                  <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-2 px-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Configuration</span>
                          <span className="text-xs text-slate-300">•</span>
                          <span className="text-xs font-bold text-slate-600">{RuleEngine.getRuleSummary(bot)}</span>
                      </div>
                      {renderRulesTab()}
                  </div>
              );

          case 'Orchestration':
              return (
                  <div className="space-y-6 h-full flex flex-col">
                      {/* Emergency Controls */}
                      <div className="bg-white border border-rose-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-full ${globalPolicy.emergencyStop ? 'bg-rose-100 text-rose-600' : 'bg-green-100 text-green-600'}`}>
                                  <Power className="w-6 h-6" />
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-900">Global Automation System</h3>
                                  <p className="text-xs text-slate-500">{globalPolicy.emergencyStop ? "All bots are currently PAUSED via kill-switch." : "System is active and processing queues."}</p>
                              </div>
                          </div>
                          <button 
                              onClick={toggleEmergencyStop}
                              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${globalPolicy.emergencyStop ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'}`}
                          >
                              {globalPolicy.emergencyStop ? "Resume Operations" : "Emergency Stop"}
                          </button>
                      </div>

                      {/* Daily Limits Grid */}
                      <div className="grid grid-cols-2 gap-4">
                          {Object.entries(globalPolicy.platformLimits).map(([platform, limits]) => (
                              <div key={platform} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                      <PlatformIcon platform={platform} size={16} />
                                      <span className="text-sm font-bold text-slate-700">{platform}</span>
                                  </div>
                                  <div className="space-y-3">
                                      {Object.entries(limits).map(([action, limit]) => {
                                          const current = dailyActions[platform as Platform]?.[action as ActionType] || 0;
                                          const pct = Math.min((current / limit) * 100, 100);
                                          return (
                                              <div key={action}>
                                                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                                      <span>{action}</span>
                                                      <span>{current}/{limit}</span>
                                                  </div>
                                                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                                      <div className={`h-full rounded-full ${pct > 90 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }}></div>
                                                  </div>
                                              </div>
                                          )
                                      })}
                                  </div>
                              </div>
                          ))}
                      </div>

                      {/* Live Decision Feed (Updated for Phase 7) */}
                      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[300px]">
                          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                                  <BrainCircuit className="w-4 h-4" /> Live Decision Feed
                              </h4>
                              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                  Monitoring {liveEvents.length} events
                              </div>
                          </div>
                          <div className="flex-1 overflow-y-auto p-0 divide-y divide-slate-50 custom-scrollbar flex flex-col-reverse">
                              {liveEvents.length === 0 ? (
                                  <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
                                      <Activity className="w-8 h-8 mb-2 opacity-50" />
                                      <p className="text-xs">Waiting for execution events...</p>
                                  </div>
                              ) : (
                                  liveEvents.map((event) => (
                                      <div key={event.id} className="p-3 hover:bg-slate-50 transition-colors flex items-start gap-3 text-sm animate-in fade-in slide-in-from-left-2">
                                          <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                              event.status === 'blocked' ? 'bg-red-500' : 
                                              event.status === 'skipped' ? 'bg-amber-500' : 
                                              'bg-green-500'
                                          }`}></div>
                                          
                                          <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2 mb-0.5">
                                                  <span className="font-bold text-slate-700 text-xs">{event.botType}</span>
                                                  <span className="text-[10px] text-slate-400 font-mono">{new Date(event.timestamp).toLocaleTimeString()}</span>
                                                  {event.riskLevel === 'high' && <span className="bg-red-100 text-red-600 text-[9px] font-bold px-1.5 rounded uppercase">High Risk</span>}
                                              </div>
                                              
                                              <div className="flex items-center gap-2">
                                                  <span className={`text-xs font-bold uppercase px-1.5 py-0.5 rounded border ${
                                                      event.action === ActionType.POST ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                      event.action === ActionType.LIKE ? 'bg-pink-50 text-pink-600 border-pink-100' :
                                                      'bg-slate-100 text-slate-600 border-slate-200'
                                                  }`}>
                                                      {event.action}
                                                  </span>
                                                  <span className="text-slate-600 truncate flex-1">
                                                      {event.assetName ? `Asset: ${event.assetName}` : event.platform}
                                                  </span>
                                              </div>

                                              {(event.status !== 'executed' && event.reason) && (
                                                  <p className="text-[10px] font-medium text-slate-500 mt-1 italic">
                                                      Reason: {event.reason}
                                                  </p>
                                              )}
                                          </div>
                                          
                                          <PlatformIcon platform={event.platform} size={16} className="text-slate-400 mt-1" />
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>
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

                                      {/* Creative Optimization Insight */}
                                      {simResult.optimizationInsight && (
                                          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                                              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                                  <TrendingUp className="w-4 h-4 text-green-600" /> Creative Optimization
                                              </h4>
                                              <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-start gap-4">
                                                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0 text-green-700 font-bold">
                                                      {simResult.optimizationInsight.score}
                                                  </div>
                                                  <div>
                                                      <div className="text-sm font-bold text-green-900">Selected: {simResult.optimizationInsight.selected}</div>
                                                      <p className="text-xs text-green-800 mt-1">{simResult.optimizationInsight.reason}</p>
                                                  </div>
                                              </div>
                                          </div>
                                      )}

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
                                                  log.status === ActivityStatus.SKIPPED ? 'bg-gray-400' :
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
                {[{ id: 'Overview', icon: Info }, { id: 'Schedule', icon: Clock }, { id: 'Rules', icon: Wand2 }, { id: 'Safety', icon: Shield }, { id: 'Orchestration', icon: BrainCircuit }, { id: 'Simulation', icon: Play }].map((item) => (
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
                    className="px-6 py-2.5 font-bold rounded-xl transition-colors hover:bg-slate-100 text-slate-600 border border-transparent"
                >
                    Cancel
                </button>
                
                <div className="relative group">
                    <button 
                        onClick={handleSave} 
                        className={`px-8 py-2.5 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 ${theme.primary} hover:scale-[1.02] active:scale-[0.98]`}
                    >
                        <Save className="w-4 h-4" /> Save Configuration
                    </button>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
