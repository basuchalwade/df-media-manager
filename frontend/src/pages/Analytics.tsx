
import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Eye, ArrowUp, ArrowDown, Activity } from 'lucide-react';
import { store } from '../services/mockStore';
import { PlatformAnalytics, Platform } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { PlatformIcon } from '../components/PlatformIcon';

export const Analytics: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'All'>('All');
  const [data, setData] = useState<PlatformAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      const stats = await store.getPlatformAnalytics(selectedPlatform);
      setData(stats);
      setIsLoading(false);
    };
    fetchData();
  }, [selectedPlatform]);

  const tabs = ['All', ...Object.values(Platform)];

  const getPlatformLabel = (p: string) => p === Platform.Twitter ? 'X' : p;

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Analytics Dashboard
          </h1>
          <p className="text-slate-500">Deep dive into your performance metrics across all channels.</p>
        </div>
      </header>

      <div className="flex overflow-x-auto pb-2 gap-2 border-b border-slate-200">
        {tabs.map((tab) => {
          const isActive = selectedPlatform === tab;
          return (
            <button
              key={tab}
              onClick={() => setSelectedPlatform(tab as Platform | 'All')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <PlatformIcon platform={tab} size={16} white={isActive} />
              {tab === 'All' ? 'All Networks' : getPlatformLabel(tab)}
            </button>
          );
        })}
      </div>

      {isLoading || !data ? (
        <div className="h-96 flex flex-col items-center justify-center text-slate-400">
          <Activity className="w-10 h-10 animate-pulse mb-4" />
          <p>Gathering insights for {selectedPlatform === 'All' ? 'All Networks' : getPlatformLabel(selectedPlatform)}...</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnalyticsCard 
              title="Total Followers" 
              value={data.summary.followers.toLocaleString()} 
              trend={data.summary.followersGrowth} 
              icon={Users}
              color="blue"
            />
            <AnalyticsCard 
              title="Impressions (7d)" 
              value={data.summary.impressions.toLocaleString()} 
              trend={data.summary.impressionsGrowth} 
              icon={Eye}
              color="purple"
            />
            <AnalyticsCard 
              title="Engagement Rate" 
              value={`${data.summary.engagementRate}%`} 
              trend={data.summary.engagementGrowth} 
              icon={Activity}
              color="green"
            />
            <AnalyticsCard 
              title="Viral Score" 
              value="8.4" 
              trend={1.2} 
              icon={TrendingUp}
              color="orange"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Growth & Reach Trends</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.history}>
                    <defs>
                      <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <Tooltip 
                       contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff'}}
                       itemStyle={{color: '#cbd5e1'}}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Area type="monotone" dataKey="impressions" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorImpressions)" name="Impressions" />
                    <Area type="monotone" dataKey="followers" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorFollowers)" name="Followers" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <h3 className="text-lg font-semibold text-slate-900 mb-6">Daily Engagement</h3>
               <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.history}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip 
                       cursor={{fill: '#f1f5f9'}}
                       contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff'}}
                    />
                    <Bar dataKey="engagement" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Interactions" />
                  </BarChart>
                </ResponsiveContainer>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AnalyticsCard = ({ title, value, trend, icon: Icon, color }: any) => {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  const isPositive = trend >= 0;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-hover hover:shadow-md">
       <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-lg ${colors[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
            {Math.abs(trend)}%
          </div>
       </div>
       <div>
         <p className="text-sm text-slate-500 font-medium">{title}</p>
         <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
       </div>
    </div>
  );
};
