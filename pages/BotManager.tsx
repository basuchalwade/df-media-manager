import React, { useEffect, useState } from 'react';
import { Bot, Power, Clock, Zap, Target } from 'lucide-react';
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
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-600" />
          Bot Manager (Growth Engine)
        </h1>
        <p className="text-slate-500">Configure your autonomous agents to grow your audience.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bots.map((bot) => (
          <div key={bot.type} className={`border rounded-xl p-6 transition-all ${bot.enabled ? 'bg-white border-blue-200 shadow-md shadow-blue-50' : 'bg-slate-50 border-slate-200'}`}>
             <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${bot.enabled ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                    {bot.type === BotType.Creator && <Zap className="w-6 h-6" />}
                    {bot.type === BotType.Engagement && <Target className="w-6 h-6" />}
                    {bot.type === BotType.Finder && <Bot className="w-6 h-6" />}
                    {bot.type === BotType.Growth && <TrendingUpIcon />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{bot.type}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${bot.enabled ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
                      {bot.enabled ? bot.status : 'Offline'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(bot.type)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                    bot.enabled ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span className="sr-only">Use setting</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      bot.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
             </div>
             
             <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                   <span className="text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Interval</span>
                   <span className="font-medium text-slate-700">{bot.intervalMinutes} mins</span>
                </div>
                <div className="bg-slate-100 rounded p-3 text-xs font-mono text-slate-600 h-24 overflow-y-auto">
                   <div className="mb-1 text-slate-400 border-b border-slate-200 pb-1">Activity Log:</div>
                   {bot.logs.length > 0 ? bot.logs.map((log, i) => (
                     <div key={i} className="truncate">> {log}</div>
                   )) : (
                     <div className="italic text-slate-400">No recent activity</div>
                   )}
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);
