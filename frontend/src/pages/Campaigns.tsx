
import React, { useEffect, useState } from 'react';
import { Target, MoreHorizontal, Plus } from 'lucide-react';
import { api } from '../services/api';
import { Campaign } from '../types';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    api.getCampaigns().then(setCampaigns);
  }, []);

  const handleNew = async () => {
    const newCamp = { name: 'New Campaign ' + Date.now().toString().slice(-4), objective: 'Reach', startDate: new Date().toISOString() };
    await api.addCampaign(newCamp);
    api.getCampaigns().then(setCampaigns);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Campaigns</h1>
          <p className="text-gray-500 mt-1">Manage your strategic initiatives.</p>
        </div>
        <button onClick={handleNew} className="bg-black text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors">
          <Plus size={18} /> New Campaign
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${campaign.status === 'Active' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                  <Target size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{campaign.name}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Started {new Date(campaign.startDate).toLocaleDateString()}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal /></button>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="text-gray-900">{campaign.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                  style={{ width: `${campaign.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex -space-x-2">
                {(campaign.bots || []).map((botId, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500">
                    B
                  </div>
                ))}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                campaign.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {campaign.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Campaigns;
