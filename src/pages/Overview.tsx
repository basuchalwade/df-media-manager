
import React from 'react';
import { TrendingUp, Users, Activity, Share2 } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Overview: React.FC = () => {
  const data = [
    { name: 'Mon', reach: 4000 },
    { name: 'Tue', reach: 3000 },
    { name: 'Wed', reach: 2000 },
    { name: 'Thu', reach: 2780 },
    { name: 'Fri', reach: 1890 },
    { name: 'Sat', reach: 2390 },
    { name: 'Sun', reach: 3490 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Your AI-driven social performance overview.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Reach', value: '24.5k', icon: Users, color: 'bg-blue-500' },
          { label: 'Engagement', value: '4.2%', icon: Activity, color: 'bg-green-500' },
          { label: 'Posts Sent', value: '142', icon: Share2, color: 'bg-purple-500' },
          { label: 'Growth', value: '+12%', icon: TrendingUp, color: 'bg-orange-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
              </div>
              <div className={`p-2 rounded-lg text-white ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Reach Trajectory</h3>
        <div className="h-[300px] w-full">
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
    </div>
  );
};

export default Overview;
