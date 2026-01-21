import React, { useEffect, useState } from 'react';
import { Save, Server, Cpu, CheckCircle, AlertTriangle, Key, ChevronRight, Globe, Shield, Bell } from 'lucide-react';
import { store } from '../services/mockStore';
import { UserSettings } from '../types';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const systemTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    store.getSettings().then(setSettings);
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await store.saveSettings(settings);
      setMessage({ text: 'Settings saved', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ text: 'Error saving', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) return <div className="p-8 text-slate-400">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-end justify-between px-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your workspace preferences.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </header>

      {message && (
        <div className={`mx-2 p-3 rounded-xl flex items-center gap-3 text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Group 1: System */}
        <div className="space-y-2">
          <h2 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Environment</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
            <div className="p-4 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors">
               <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                   <Server className="w-5 h-5" />
                 </div>
                 <div>
                   <h3 className="font-semibold text-slate-900">Simulation Mode</h3>
                   <p className="text-xs text-slate-500">Use mock data instead of real APIs</p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <button 
                   onClick={() => setSettings({...settings, demoMode: !settings.demoMode})}
                   className={`w-12 h-7 rounded-full transition-colors duration-300 p-1 ${settings.demoMode ? 'bg-green-500' : 'bg-slate-200'}`}
                 >
                   <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${settings.demoMode ? 'translate-x-5' : ''}`} />
                 </button>
               </div>
            </div>
            
            <div className="p-4 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors">
               <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                   <Globe className="w-5 h-5" />
                 </div>
                 <div>
                   <h3 className="font-semibold text-slate-900">Region</h3>
                   <p className="text-xs text-slate-500">{systemTz} (System Default)</p>
                 </div>
               </div>
               <ChevronRight className="w-5 h-5 text-slate-300" />
            </div>
          </div>
        </div>

        {/* Group 2: AI */}
        <div className="space-y-2">
          <h2 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Intelligence</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
            <div className="p-4 flex flex-col gap-4">
               <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                   <Cpu className="w-5 h-5" />
                 </div>
                 <div className="flex-1">
                   <h3 className="font-semibold text-slate-900">Gemini API Key</h3>
                   <p className="text-xs text-slate-500">Required for content generation</p>
                 </div>
               </div>
               <div className="relative">
                 <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                    type="password" 
                    value={settings.geminiApiKey}
                    onChange={(e) => setSettings({...settings, geminiApiKey: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Enter your AI Studio Key..."
                 />
               </div>
            </div>
          </div>
        </div>

        {/* Group 3: General */}
        <div className="space-y-2">
           <h2 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">General</h2>
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
              <div className="p-4 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors">
                 <div className="flex items-center gap-4">
                   <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                     <Shield className="w-5 h-5" />
                   </div>
                   <span className="font-semibold text-slate-900">Security Log</span>
                 </div>
                 <ChevronRight className="w-5 h-5 text-slate-300" />
              </div>
              <div className="p-4 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors">
                 <div className="flex items-center gap-4">
                   <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                     <Bell className="w-5 h-5" />
                   </div>
                   <span className="font-semibold text-slate-900">Notifications</span>
                 </div>
                 <ChevronRight className="w-5 h-5 text-slate-300" />
              </div>
           </div>
        </div>

        <div className="pt-4 text-center">
          <p className="text-xs text-slate-400">ContentCaster Enterprise v1.2.0 (8492)</p>
          <p className="text-[10px] text-slate-300 mt-1">Powered by Dossiefoyer Private Limited</p>
        </div>
      </div>
    </div>
  );
};