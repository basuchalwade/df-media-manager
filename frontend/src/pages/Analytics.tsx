
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';

const Analytics = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    api.getAnalytics().then(d => setData(d.history));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Performance</h1>
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
