import React, { useEffect, useState } from 'react';
import { Bot, Power, Clock, Zap, Target, TrendingUp, Search, Activity, Pause, Play, ChevronRight } from 'lucide-react';
import { store } from '../services/mockStore';
import { BotConfig, BotType } from '../types';

export const BotManager: React.FC = () => {
  const [bots, setBots] = useState<BotConfig[]>([]);

  useEffect(() => {
    store.getBots().then(setBots);
  }, []);

  const handleToggle = async (type: BotType) => {
    const updated = await store.toggleBot(type);
    setBots(updated);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex items-end justify-between px-2">
        <div>
          <h1 className="text-[34px] font-bold text-[#1d1d1f] tracking-tight leading-tight">Bot Manager</h1>
          <p className="text-gray-500 text-lg font-medium leading-relaxed mt-1">
            Automated agents • 4 Active
          </p>
        </div>
        <div className="flex gap-2">
           <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-black/5 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Activity className="w-4 h-4 text-green-500" />
              System Healthy
           </div>
        </div>
      </div>

      {/* Grid Layout - Home App Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {bots.map((bot) => (
          <BotCard key={bot.type} bot={bot} onToggle={() => handleToggle(bot.type)} />
        ))}
      </div>
    </div>
  );
};

// Sub-component for Apple-style Tile
const BotCard = ({ bot, onToggle }: { bot: BotConfig; onToggle: () => void }) => {
  const isRunning = bot.enabled;
  
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
    switch (bot.type) {
      case BotType.Creator: return 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-orange-500/30';
      case BotType.Engagement: return 'bg-gradient-to-br from-blue-400 to-indigo-500 shadow-blue-500/30';
      case BotType.Finder: return 'bg-gradient-to-br from-purple-400 to-pink-500 shadow-pink-500/30';
      case BotType.Growth: return 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/30';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`group relative overflow-hidden rounded-[32px] p-6 transition-all duration-300 apple-ease border border-white/50
      ${isRunning 
        ? 'bg-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] scale-[1.005]' 
        : 'bg-[#FDFDFD] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] opacity-95'
      }`}>
      
      {/* Background decoration */}
      <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-5 blur-3xl transition-opacity duration-500 ${getColor().split(' ')[0]} ${isRunning ? 'opacity-10' : 'opacity-0'}`}></div>

      <div className="flex flex-col h-full relative z-10">
        
        {/* Top Row: Icon & Toggle */}
        <div className="flex justify-between items-start mb-6">
          <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 ${getColor()}`}>
            {getIcon()}
          </div>
          
          <button 
            onClick={onToggle}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none shadow-inner
              ${isRunning ? 'bg-green-500' : 'bg-gray-200'}`}
          >
            <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)
              ${isRunning ? 'translate-x-6' : 'translate-x-0'}`} 
            />
          </button>
        </div>

        {/* Info */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-[#1d1d1f] tracking-tight mb-1">{bot.type}</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-semibold text-gray-500">
              {isRunning ? 'Active & Running' : 'Paused'}
            </span>
            {isRunning && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500 font-medium ml-2">
                 Every {bot.intervalMinutes}m
              </span>
            )}
          </div>
        </div>

        {/* Live Feed (Replaces Terminal) */}
        <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-1 flex-1 min-h-[140px] border border-black/5 shadow-inner flex flex-col">
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
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
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