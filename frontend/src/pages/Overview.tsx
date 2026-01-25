
import React, { useEffect, useState } from 'react';
import { Users, Activity, TrendingUp, Share2, ArrowUp } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';

const Overview = () => {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const s = await api.getStats();
      const a = await api.getAnalytics();
      setStats(s);
      setChartData(a.history);
    };
    load();
    const interval = setInterval(load, 3000); // Live poll
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div className="p-8">Loading Dashboard...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Overview</h1>
        <p className="text-gray-500 mt-1">Your real-time social command center.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Reach" value={stats.totalReach.toLocaleString()} icon={Users} color="bg-blue-500" trend="+12%" />
        <StatCard label="Engagement" value={`${stats.engagementRate}%`} icon={Activity} color="bg-green-500" trend="+4.2%" />
        <StatCard label="Active Bots" value={stats.activeBots} icon={TrendingUp} color="bg-purple-500" trend="Stable" />
        <StatCard label="Posts Sent" value={stats.totalPosts} icon={Share2} color="bg-orange-500" trend="+8" />
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Reach Trajectory</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorReach)" />
            </AreaChart>
          </ResponsiveContainer>
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
