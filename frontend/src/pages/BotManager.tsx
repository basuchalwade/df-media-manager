import React, { useEffect, useState } from 'react';
import { Bot, Power, Activity, Settings, AlertCircle } from 'lucide-react';
import { store } from '../services/mockStore';
import { BotConfig, BotType } from '../types';

interface BotManagerProps {
  onNavigate?: (page: string, params?: any) => void;
}

export const BotManager: React.FC<BotManagerProps> = ({ onNavigate }) => {
  const [bots, setBots] = useState<BotConfig[]>([]);

  useEffect(() => {
    store.getBots().then(setBots);
  }, []);

  const toggleBot = async (type: BotType) => {
    const updated = await store.toggleBot(type);
    setBots(updated as BotConfig[]);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Bot Swarm</h1>
        <p className="text-gray-500">Configure your autonomous agents.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {bots.map((bot) => (
          <div key={bot.type} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
              <Bot size={120} />
            </div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${bot.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  <Bot size={24} />
                </div>
                <button 
                  onClick={() => toggleBot(bot.type)}
                  className={`p-2 rounded-full transition-colors ${bot.enabled ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}
                >
                  <Power size={20} />
                </button>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-1">{bot.type}</h3>
              <p className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${bot.status === 'Running' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                {bot.status}
              </p>

              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between text-xs font-bold text-gray-500 uppercase mb-1">
                    <span>Daily Capacity</span>
                    <span>{bot.stats.currentDailyActions}/{bot.stats.maxDailyActions}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${(bot.stats.currentDailyActions / bot.stats.maxDailyActions) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button className="flex-1 py-2 text-sm font-bold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Logs
                </button>
                <button className="flex-1 py-2 text-sm font-bold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Config
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
