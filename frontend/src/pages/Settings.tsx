
import React, { useEffect, useState } from 'react';
import { Save, User as UserIcon, Briefcase } from 'lucide-react';
import { api } from '../services/api';
import { UserSettings, User } from '../types';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const s = await api.getSettings();
    const u = await api.getCurrentUser();
    setSettings(s);
    setCurrentUser(u);
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    await api.saveSettings(settings);
    setIsSaving(false);
    alert('Settings Saved');
  };

  if (!settings || !currentUser) return <div className="p-8 text-slate-400">Loading settings...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><UserIcon className="w-5 h-5"/> Profile</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Name</label>
                    <input type="text" value={currentUser.name} disabled className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Email</label>
                    <input type="text" value={currentUser.email} disabled className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm p-2" />
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5"/> Workspace</h2>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Simulation Mode</span>
                    <button 
                        onClick={() => setSettings({...settings, demoMode: !settings.demoMode})}
                        className={`w-12 h-6 rounded-full transition-colors relative ${settings.demoMode ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.demoMode ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
                <p className="text-xs text-slate-500">Enable to use mock data and prevent real API calls.</p>
            </div>
        </div>

        <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
        >
            <Save className="w-4 h-4" /> Save Changes
        </button>
    </div>
  );
};
