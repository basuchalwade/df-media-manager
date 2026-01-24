
import React, { useEffect, useState } from 'react';
import { Target, Plus, TrendingUp, Users, DollarSign, Calendar, Clock, MoreVertical, Play, Pause, Bot, ArrowRight, BarChart3, BrainCircuit, Check, X, Megaphone, Globe } from 'lucide-react';
import { store } from '../services/mockStore';
import { Campaign, CampaignObjective, CampaignStatus, Platform, BotType, CampaignRecommendation } from '../types';
import { PlatformIcon } from '../components/PlatformIcon';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';

export const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'intelligence'>('overview');

  useEffect(() => {
    loadCampaigns();
    const interval = setInterval(loadCampaigns, 3000); // Live metrics
    return () => clearInterval(interval);
  }, []);

  const loadCampaigns = async () => {
    const data = await store.getCampaigns();
    setCampaigns(data);
    // Keep selected campaign metrics fresh
    if (selectedCampaign) {
        const fresh = data.find(c => c.id === selectedCampaign.id);
        if (fresh) setSelectedCampaign(fresh);
    }
  };

  const handleCreate = async (data: any) => {
      await store.addCampaign(data);
      loadCampaigns();
      setIsCreateModalOpen(false);
  };

  const handleApplyRec = async (campaignId: string, recId: string) => {
      await store.applyCampaignRecommendation(campaignId, recId);
      loadCampaigns();
  };

  const handleDismissRec = async (campaignId: string, recId: string) => {
      await store.dismissCampaignRecommendation(campaignId, recId);
      loadCampaigns();
  };

  return (
    <div className="space-y-6 h-full flex flex-col pb-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-600" />
            Campaign Intelligence
          </h1>
          <p className="text-lg text-slate-500 font-medium mt-1">Orchestrate multi-bot strategies and budget allocation.</p>
        </div>
        {!selectedCampaign && (
            <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95"
            >
                <Plus className="w-4 h-4" /> New Campaign
            </button>
        )}
      </div>

      {selectedCampaign ? (
          // Detail View
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
              <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                  <button onClick={() => setSelectedCampaign(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm flex items-center gap-1">
                      Campaigns <ArrowRight className="w-3 h-3" />
                  </button>
                  <h2 className="text-xl font-bold text-slate-900">{selectedCampaign.name}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${selectedCampaign.status === CampaignStatus.Active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {selectedCampaign.status}
                  </span>
              </div>

              {/* Tabs */}
              <div className="flex gap-6 border-b border-slate-100">
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                      Overview & Pacing
                  </button>
                  <button 
                    onClick={() => setActiveTab('intelligence')}
                    className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'intelligence' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                      Intelligence Engine
                  </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  {activeTab === 'overview' && <CampaignOverview campaign={selectedCampaign} />}
                  {activeTab === 'intelligence' && <CampaignIntelligence campaign={selectedCampaign} onApplyRec={handleApplyRec} onDismissRec={handleDismissRec} />}
              </div>
          </div>
      ) : (
          // List View
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pb-20">
              {campaigns.map(camp => (
                  <div 
                    key={camp.id} 
                    onClick={() => setSelectedCampaign(camp)}
                    className="bg-white rounded-2xl border border-slate-200 p-6 cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all group"
                  >
                      <div className="flex justify-between items-start mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getObjectColor(camp.objective)}`}>
                              {getObjectiveIcon(camp.objective)}
                          </div>
                          <div className="flex items-center gap-2">
                              {camp.status === CampaignStatus.Active && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
                              <MoreVertical className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                          </div>
                      </div>
                      
                      <h3 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{camp.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 font-medium">
                          <span>{camp.objective}</span>
                          <span>•</span>
                          <span>{new Date(camp.startDate).toLocaleDateString()}</span>
                      </div>

                      {/* Mini Budget Bar */}
                      <div className="mb-4">
                          <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                              <span>${camp.budget.spent.toFixed(0)} Spent</span>
                              <span>${camp.budget.total.toLocaleString()} Total</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-slate-800 rounded-full" style={{ width: `${Math.min((camp.budget.spent / camp.budget.total) * 100, 100)}%` }}></div>
                          </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                          <div className="flex -space-x-2">
                              {camp.platforms.map(p => (
                                  <div key={p} className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                      <PlatformIcon platform={p} size={10} />
                                  </div>
                              ))}
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
                              <Bot className="w-3 h-3" />
                              {camp.botIds.length} Bots
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {isCreateModalOpen && <CreateCampaignModal onClose={() => setIsCreateModalOpen(false)} onCreate={handleCreate} />}
    </div>
  );
};

// --- Sub-components ---

const CampaignOverview: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
    // Mock Pacing Data
    const data = Array.from({length: 10}, (_, i) => ({
        day: `Day ${i+1}`,
        spend: Math.floor(campaign.budget.daily * (0.8 + Math.random() * 0.4)),
        target: campaign.budget.daily
    }));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
                <MetricCard title="Total Spend" value={`$${campaign.budget.spent.toLocaleString()}`} sub={`of $${campaign.budget.total}`} icon={DollarSign} color="slate" />
                <MetricCard title="Impressions" value={campaign.metrics.impressions.toLocaleString()} sub="Total Views" icon={Megaphone} color="blue" />
                <MetricCard title="Conversions" value={campaign.metrics.conversions.toLocaleString()} sub={`Avg CPA: $${campaign.metrics.costPerResult.toFixed(2)}`} icon={Target} color="green" />
                <MetricCard title="ROAS" value={`${campaign.metrics.roas || 0}x`} sub="Return on Ad Spend" icon={TrendingUp} color="purple" />
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6">Budget Pacing (Last 10 Days)</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="spend" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Actual Spend" />
                            <Bar dataKey="target" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Target Cap" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const CampaignIntelligence: React.FC<{ campaign: Campaign, onApplyRec: any, onDismissRec: any }> = ({ campaign, onApplyRec, onDismissRec }) => {
    return (
        <div className="grid grid-cols-3 gap-6 h-full">
            <div className="col-span-2 space-y-6">
                {/* Bot Contribution */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Bot className="w-5 h-5 text-indigo-600" /> Bot Attribution
                    </h3>
                    <div className="space-y-4">
                        {campaign.botIds.map(botType => (
                            <div key={botType} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-slate-600 border border-slate-200">
                                        {botType === BotType.Creator ? <Megaphone className="w-5 h-5" /> : 
                                         botType === BotType.Engagement ? <Users className="w-5 h-5" /> : 
                                         <TrendingUp className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-sm">{botType}</div>
                                        <div className="text-xs text-slate-500">Contributing to {campaign.objective}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-slate-900">${(Math.random() * 200).toFixed(0)} Spent</div>
                                    <div className="text-xs text-green-600 font-bold">+{(Math.random() * 20).toFixed(1)}% Lift</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Strategy Text */}
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                    <h3 className="font-bold text-lg mb-2 relative z-10">Active Strategy: Multi-Agent Coordination</h3>
                    <p className="text-slate-300 text-sm leading-relaxed relative z-10 max-w-2xl">
                        The <strong>Creator Bot</strong> is prioritizing high-engagement formats on LinkedIn to drive top-of-funnel traffic, while the <strong>Engagement Bot</strong> nurtures comments to boost algorithmic visibility. Budget is dynamically shifting towards Twitter during peak hours (9 AM - 11 AM EST).
                    </p>
                </div>
            </div>

            {/* Recommendations Panel */}
            <div className="bg-gradient-to-b from-purple-50 to-white border border-purple-100 rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                    <BrainCircuit className="w-6 h-6 text-purple-600" />
                    <h3 className="font-bold text-slate-900">AI Suggestions</h3>
                </div>
                
                <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-1">
                    {campaign.aiRecommendations.filter(r => r.status === 'pending').map(rec => (
                        <div key={rec.id} className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm transition-transform hover:scale-[1.02]">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${rec.impact === 'High' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                    {rec.impact} Impact
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">Just now</span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm mb-1">{rec.title}</h4>
                            <p className="text-xs text-slate-600 mb-4 leading-relaxed">{rec.description}</p>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => onApplyRec(campaign.id, rec.id)}
                                    className="flex-1 bg-purple-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
                                >
                                    <Check className="w-3 h-3" /> {rec.actionLabel}
                                </button>
                                <button 
                                    onClick={() => onDismissRec(campaign.id, rec.id)}
                                    className="px-3 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {campaign.aiRecommendations.filter(r => r.status === 'pending').length === 0 && (
                        <div className="text-center text-slate-400 text-sm py-8 italic">
                            No new recommendations. Strategy is optimized.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CreateCampaignModal: React.FC<{ onClose: () => void, onCreate: (data: any) => void }> = ({ onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [objective, setObjective] = useState<CampaignObjective>(CampaignObjective.Reach);
    const [budget, setBudget] = useState(100);
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [bots, setBots] = useState<BotType[]>([]);

    const handleSubmit = () => {
        onCreate({
            name,
            objective,
            platforms,
            botIds: bots,
            startDate: new Date().toISOString(),
            budget: { total: budget * 30, daily: budget, spent: 0, currency: 'USD' }
        });
    };

    const togglePlatform = (p: Platform) => {
        setPlatforms(prev => prev.includes(p) ? prev.filter(i => i !== p) : [...prev, p]);
    };

    const toggleBot = (b: BotType) => {
        setBots(prev => prev.includes(b) ? prev.filter(i => i !== b) : [...prev, b]);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-xl text-slate-900">Create New Campaign</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Campaign Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-2 font-medium" placeholder="e.g. Summer Sale 2024" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Objective</label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.values(CampaignObjective).map(obj => (
                                <button key={obj} onClick={() => setObjective(obj)} className={`py-2 rounded-lg text-sm font-bold border transition-all ${objective === obj ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}>{obj}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Daily Budget ($)</label>
                        <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} className="w-full border border-slate-200 rounded-lg px-4 py-2 font-medium" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Platforms</label>
                        <div className="flex gap-2">
                            {[Platform.Twitter, Platform.LinkedIn, Platform.Instagram].map(p => (
                                <button key={p} onClick={() => togglePlatform(p)} className={`p-2 rounded-lg border ${platforms.includes(p) ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                                    <PlatformIcon platform={p} size={18} white={platforms.includes(p)} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Assigned Agents</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(BotType).map(b => (
                                <button key={b} onClick={() => toggleBot(b)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${bots.includes(b) ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}>{b}</button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={!name} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">Launch Campaign</button>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, sub, icon: Icon, color }: any) => {
    const colors: any = { slate: 'bg-slate-100 text-slate-600', blue: 'bg-blue-100 text-blue-600', green: 'bg-green-100 text-green-600', purple: 'bg-purple-100 text-purple-600' };
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">{title}</span>
                <div className={`p-1.5 rounded-lg ${colors[color]}`}><Icon className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">{sub}</div>
        </div>
    );
}

const getObjectiveIcon = (obj: CampaignObjective) => {
    switch (obj) {
        case CampaignObjective.Reach: return <Megaphone className="w-5 h-5 text-purple-600" />;
        case CampaignObjective.Engagement: return <Users className="w-5 h-5 text-pink-600" />;
        case CampaignObjective.Traffic: return <Globe className="w-5 h-5 text-blue-600" />;
        case CampaignObjective.Conversions: return <DollarSign className="w-5 h-5 text-green-600" />;
    }
};

const getObjectColor = (obj: CampaignObjective) => {
    switch (obj) {
        case CampaignObjective.Reach: return 'bg-purple-50';
        case CampaignObjective.Engagement: return 'bg-pink-50';
        case CampaignObjective.Traffic: return 'bg-blue-50';
        case CampaignObjective.Conversions: return 'bg-green-50';
    }
};
