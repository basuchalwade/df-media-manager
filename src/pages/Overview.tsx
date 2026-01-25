
import React from 'react';
import { Users, Activity, TrendingUp, Share2, ArrowUp } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Overview = () => {
  const data = [
    { name: 'Mon', reach: 4000 }, { name: 'Tue', reach: 3000 },
    { name: 'Wed', reach: 2000 }, { name: 'Thu', reach: 2780 },
    { name: 'Fri', reach: 1890 }, { name: 'Sat', reach: 2390 },
    { name: 'Sun', reach: 3490 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Overview</h1>
        <p className="text-gray-500 mt-1">Your real-time social command center.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Reach" value="24.5k" icon={Users} color="bg-blue-500" trend="+12%" />
        <StatCard label="Engagement" value="4.2%" icon={Activity} color="bg-green-500" trend="+4.2%" />
        <StatCard label="Active Bots" value="3" icon={TrendingUp} color="bg-purple-500" trend="Stable" />
        <StatCard label="Posts Sent" value="142" icon={Share2} color="bg-orange-500" trend="+8" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Reach Trajectory</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="reach" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorReach)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-black text-white p-8 rounded-[32px] shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Viral Trend Detected</h3>
            <p className="text-gray-400 mb-6 text-sm">"AI in Healthcare" is spiking on LinkedIn. Your bot suggests a new post.</p>
          </div>
          <button className="relative z-10 w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors">
            Generate Post
          </button>
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-50 -mr-16 -mt-16 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-default">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
      <div className={`${color} p-2 rounded-lg text-white`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="mt-4 flex items-center text-xs font-medium text-green-600">
      <ArrowUp size={12} className="mr-1" /> {trend} this week
    </div>
  </div>
);

export default Overview;
