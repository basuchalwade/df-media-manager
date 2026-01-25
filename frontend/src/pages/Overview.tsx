
import React, { useEffect, useState } from 'react';
import { Users, Activity, TrendingUp, Share2 } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { store } from '../services/mockStore';

export const Overview = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    store.getStats().then(setStats);
  }, []);

  const chartData = [
    { name: 'Mon', reach: 4000 }, { name: 'Tue', reach: 3000 },
    { name: 'Wed', reach: 2000 }, { name: 'Thu', reach: 2780 },
    { name: 'Fri', reach: 4890 }, { name: 'Sat', reach: 2390 },
    { name: 'Sun', reach: 3490 },
  ];

  if (!stats) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Overview</h1>
        <p className="text-gray-500 mt-1">Your real-time social command center.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Reach" value={stats.totalReach.toLocaleString()} icon={Users} color="bg-blue-500" />
        <StatCard label="Engagement" value={`${stats.engagementRate}%`} icon={Activity} color="bg-green-500" />
        <StatCard label="Active Bots" value={stats.activeBots} icon={TrendingUp} color="bg-purple-500" />
        <StatCard label="Posts Sent" value={stats.totalPosts} icon={Share2} color="bg-orange-500" />
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Reach Trajectory</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="reach" stroke="#3b82f6" strokeWidth={3} fill="#eff6ff" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
      <div className={`${color} p-2 rounded-lg text-white`}>
        <Icon size={20} />
      </div>
    </div>
  </div>
);
