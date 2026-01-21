import React, { useEffect, useState } from 'react';
import { Activity, Users, TrendingUp, Share2, AlertCircle } from 'lucide-react';
import { store } from '../services/mockStore';
import { DashboardStats, BotConfig } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

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
    const interval = setInterval(loadData, 5000); // Poll for updates
    return () => clearInterval(interval);
  }, []);

  const chartData = [
    { name: 'Mon', reach: 4000, engagement: 2400 },
    { name: 'Tue', reach: 3000, engagement: 1398 },
    { name: 'Wed', reach: 2000, engagement: 9800 },
    { name: 'Thu', reach: 2780, engagement: 3908 },
    { name: 'Fri', reach: 1890, engagement: 4800 },
    { name: 'Sat', reach: 2390, engagement: 3800 },
    { name: 'Sun', reach: 3490, engagement: 4300 },
  ];

  if (!stats) return <div className="p-8 text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back. Here's what's happening today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Reach" 
          value={stats.totalReach.toLocaleString()} 
          icon={Activity} 
          trend="+12.5%" 
          color="blue" 
        />
        <StatCard 
          title="Engagement Rate" 
          value={`${stats.engagementRate}%`} 
          icon={TrendingUp} 
          trend="+2.1%" 
          color="green" 
        />
        <StatCard 
          title="Active Bots" 
          value={stats.activeBots.toString()} 
          icon={Users} 
          subtext="Running optimally" 
          color="purple" 
        />
        <StatCard 
          title="Total Posts" 
          value={stats.totalPosts.toString()} 
          icon={Share2} 
          subtext="Across 6 platforms" 
          color="orange" 
        />
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Weekly Performance</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChartComponent data={chartData} />
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Bot Logs */}
        <div className="bg-slate-900 text-slate-100 rounded-xl shadow-sm p-6 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Bot Activity
            </h3>
            <span className="text-xs bg-slate-800 px-2 py-1 rounded">Real-time</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar" style={{ maxHeight: '300px' }}>
            {bots.filter(b => b.logs.length > 0).flatMap(b => b.logs.map((log, i) => (
              <div key={`${b.type}-${i}`} className="text-sm border-l-2 border-blue-500 pl-3 py-1">
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>{b.type}</span>
                  <span>Now</span>
                </div>
                <div className="text-slate-200 mt-0.5">{log}</div>
              </div>
            )))}
            {bots.every(b => b.logs.length === 0) && (
              <div className="text-slate-500 text-sm text-center py-10 italic">
                No recent activity. Enable bots in Bot Manager.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Components helpers
const StatCard = ({ title, value, icon: Icon, trend, subtext, color }: any) => {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        {trend ? (
          <span className="text-green-600 font-medium flex items-center gap-1">
            {trend} <span className="text-slate-400 font-normal">vs last week</span>
          </span>
        ) : (
          <span className="text-slate-400">{subtext}</span>
        )}
      </div>
    </div>
  );
};

const AreaChartComponent = ({ data }: { data: any[] }) => (
  <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
    <Tooltip 
      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
      itemStyle={{ color: '#fff' }}
    />
    <Line type="monotone" dataKey="reach" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
    <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
  </LineChart>
);
