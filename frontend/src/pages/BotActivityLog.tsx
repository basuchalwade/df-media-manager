
import React, { useEffect, useState } from 'react';
import { store } from '../services/mockStore';
import { BotActivity, BotType, ActivityStatus } from '../types';
import { ArrowLeft, CheckCircle, AlertTriangle, Clock, Terminal, RefreshCw, Calendar } from 'lucide-react';

interface BotActivityLogProps {
  botType: BotType;
  onBack: () => void;
}

export const BotActivityLog: React.FC<BotActivityLogProps> = ({ botType, onBack }) => {
  const [activities, setActivities] = useState<BotActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Errors'>('All');

  const fetchActivity = async () => {
    // Only set loading on first load to avoid flicker
    if (activities.length === 0) setLoading(true);
    const data = await store.getBotActivity(botType);
    setActivities(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 3000); // Live poll
    return () => clearInterval(interval);
  }, [botType]);

  const filtered = activities.filter(a => {
    if (filter === 'Errors') return a.status === ActivityStatus.FAILED;
    return true;
  });

  // Grouping Logic
  const groupedActivities = filtered.reduce((groups, activity) => {
      const date = new Date(activity.createdAt);
      const today = new Date();
      let key = date.toLocaleDateString();
      
      if (date.toDateString() === today.toDateString()) key = 'Today';
      else if (date.toDateString() === new Date(today.setDate(today.getDate() - 1)).toDateString()) key = 'Yesterday';
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(activity);
      return groups;
  }, {} as Record<string, BotActivity[]>);

  const getStatusIcon = (status: ActivityStatus) => {
    switch (status) {
      case ActivityStatus.SUCCESS: return <CheckCircle className="w-4 h-4 text-green-500" />;
      case ActivityStatus.FAILED: return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case ActivityStatus.STARTED: return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case ActivityStatus.SKIPPED: return <Terminal className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTimeAgo = (dateStr: string) => {
      const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return new Date(dateStr).toLocaleTimeString();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{botType} Activity</h1>
            <p className="text-sm text-slate-500">Real-time execution logs and health checks.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
               onClick={fetchActivity} 
               className="p-2 text-slate-500 hover:text-black transition-colors"
               title="Refresh"
            >
               <RefreshCw className={`w-4 h-4 ${loading && activities.length === 0 ? 'animate-spin' : ''}`} />
            </button>
            <div className="bg-white border border-slate-200 rounded-lg p-1 flex">
               <button 
                  onClick={() => setFilter('All')} 
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filter === 'All' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
               >
                  All Logs
               </button>
               <button 
                  onClick={() => setFilter('Errors')} 
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filter === 'Errors' ? 'bg-red-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
               >
                  Errors Only
               </button>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
         {loading && activities.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-slate-400 gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" /> Loading Activity...
            </div>
         ) : (
            <div className="flex flex-col">
                <div className="grid grid-cols-12 gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide sticky top-0 backdrop-blur-sm z-10">
                   <div className="col-span-2">Time</div>
                   <div className="col-span-2">Status</div>
                   <div className="col-span-1">Action</div>
                   <div className="col-span-5">Message</div>
                   <div className="col-span-2 text-right">Duration</div>
                </div>
                
                <div className="divide-y divide-slate-50">
                   {filtered.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-sm">No logs found matching your criteria.</div>
                   ) : (
                      Object.entries(groupedActivities).map(([group, groupActs]: [string, BotActivity[]]) => (
                          <React.Fragment key={group}>
                              {/* Date Header */}
                              <div className="px-6 py-2 bg-slate-50/80 border-y border-slate-100 text-xs font-bold text-slate-500 uppercase flex items-center gap-2 sticky top-10 z-0">
                                  <Calendar className="w-3 h-3" />
                                  {group}
                              </div>
                              
                              {groupActs.map((act) => {
                                 const duration = act.finishedAt 
                                    ? Math.abs(new Date(act.finishedAt).getTime() - new Date(act.createdAt).getTime())
                                    : 0;
                                 
                                 return (
                                    <div key={act.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50 transition-colors items-center text-sm animate-in fade-in slide-in-from-top-1">
                                       <div className="col-span-2 font-mono text-slate-500 text-xs">
                                          <div className="font-bold text-slate-700">{new Date(act.createdAt).toLocaleTimeString()}</div>
                                          <div className="text-[10px] text-slate-400">{getTimeAgo(act.createdAt)}</div>
                                       </div>
                                       <div className="col-span-2">
                                          <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                             act.status === ActivityStatus.SUCCESS ? 'bg-green-50 text-green-700 border-green-200' :
                                             act.status === ActivityStatus.FAILED ? 'bg-red-50 text-red-700 border-red-200' :
                                             act.status === ActivityStatus.SKIPPED ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                             'bg-blue-50 text-blue-700 border-blue-200'
                                          }`}>
                                             {getStatusIcon(act.status)}
                                             {act.status}
                                          </div>
                                       </div>
                                       <div className="col-span-1 font-bold text-slate-700 text-xs">
                                          {act.actionType}
                                       </div>
                                       <div className="col-span-5">
                                          <p className="text-slate-800 font-medium truncate">{act.message}</p>
                                          {act.error && (
                                             <p className="text-red-600 text-xs mt-1 font-mono bg-red-50 p-1 rounded inline-block">
                                                {act.error}
                                             </p>
                                          )}
                                       </div>
                                       <div className="col-span-2 text-right text-xs text-slate-400 font-mono">
                                          {duration > 0 ? `${duration}ms` : '-'}
                                       </div>
                                    </div>
                                 );
                              })}
                          </React.Fragment>
                      ))
                   )}
                </div>
            </div>
         )}
      </div>
    </div>
  );
};
