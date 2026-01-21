import React, { useEffect, useState } from 'react';
import { Activity, Users, TrendingUp, Share2, ArrowRight, ChevronRight } from 'lucide-react';
import { store } from '../services/mockStore';
import { DashboardStats, BotConfig } from '../types';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const Overview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bots, setBots] = useState<BotConfig[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const s = await store.getStats();
      const b = await store.getBots();
      setStats(s);
      setBots(b);
    };
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Smoother chart data
  const chartData = [
    { name: 'Mon', reach: 4000, engagement: 2400 },
    { name: 'Tue', reach: 3000, engagement: 3398 },
    { name: 'Wed', reach: 4000, engagement: 2800 },
    { name: 'Thu', reach: 2780, engagement: 3908 },
    { name: 'Fri', reach: 4890, engagement: 4800 },
    { name: 'Sat', reach: 5390, engagement: 3800 },
    { name: 'Sun', reach: 6490, engagement: 4300 },
  ];

  if (!stats) return <div className="p-8 text-gray-400 font-medium">Loading Overview...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Title */}
      <div className="flex flex-col gap-1 px-2">
        <h1 className="text-[34px] font-bold text-[#1d1d1f] tracking-tight">Summary</h1>
        <p className="text-lg text-gray-500 font-medium">Your social performance today.</p>
      </div>

      {/* Main Grid - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-min">
        
        {/* Large Chart Card */}
        <div className="md:col-span-2 xl:col-span-2 row-span-2 bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-black/5 relative overflow-hidden group">
           <div className="flex justify-between items-start mb-2 relative z-10">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Reach</h3>
                <div className="text-4xl font-bold text-[#1d1d1f] mt-1 tracking-tight">{stats.totalReach.toLocaleString()}</div>
              </div>
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                 <TrendingUp className="w-3 h-3 mr-1" /> +12%
              </div>
           </div>
           
           <div className="absolute inset-x-0 bottom-0 h-48 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData}>
                 <defs>
                   <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#007AFF" stopOpacity={0.2}/>
                     <stop offset="100%" stopColor="#007AFF" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <Tooltip cursor={false} content={<CustomTooltip />} />
                 <Area 
                   type="monotone" 
                   dataKey="reach" 
                   stroke="#007AFF" 
                   strokeWidth={3} 
                   fill="url(#colorReach)" 
                   animationDuration={1500}
                 />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Metric Cards - Apple Health Style */}
        <MetricCard 
          title="Engagement" 
          value={`${stats.engagementRate}%`} 
          icon={Activity} 
          color="bg-orange-500"
          footer="Average across all channels"
        />
        <MetricCard 
          title="Active Bots" 
          value={stats.activeBots.toString()} 
          icon={Users} 
          color="bg-purple-500" 
          footer="Running efficiently"
        />
        <MetricCard 
          title="Posts Published" 
          value={stats.totalPosts.toString()} 
          icon={Share2} 
          color="bg-blue-500" 
          footer="Last 7 days"
        />
        
        {/* Quick Action / Insight */}
        <div className="bg-black text-white rounded-[32px] p-6 shadow-xl flex flex-col justify-between relative overflow-hidden cursor-pointer group hover:scale-[1.02] transition-transform">
           <div className="absolute top-0 right-0 w-32 h-32 bg-gray-800 rounded-full blur-2xl -mr-10 -mt-10 opacity-50"></div>
           <div className="relative z-10">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
                 <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold leading-tight mb-2">Viral Trend Detected</h3>
              <p className="text-sm text-gray-300 font-medium">"AI in Healthcare" is trending on Twitter.</p>
           </div>
           <div className="relative z-10 flex items-center gap-2 text-sm font-semibold mt-4 text-blue-300 group-hover:text-blue-200">
              Create Post <ChevronRight className="w-4 h-4" />
           </div>
        </div>

      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon: Icon, color, footer }: any) => (
  <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-black/5 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 apple-ease">
     <div className="flex items-start justify-between">
        <div className="flex flex-col">
           <span className="text-[13px] font-semibold text-gray-500 flex items-center gap-2 mb-2">
             <span className={`w-2 h-2 rounded-full ${color}`}></span>
             {title}
           </span>
           <span className="text-3xl font-bold text-[#1d1d1f] tracking-tight">{value}</span>
        </div>
        <div className={`p-2 rounded-full bg-gray-50 text-gray-400`}>
           <Icon className="w-5 h-5" />
        </div>
     </div>
     {footer && <div className="mt-4 pt-4 border-t border-gray-100 text-xs font-medium text-gray-400">{footer}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-white/20 text-xs font-semibold text-gray-700">
        <p className="mb-1 text-gray-400">{label}</p>
        <p className="text-blue-600">{payload[0].value.toLocaleString()} Reach</p>
      </div>
    );
  }
  return null;
};