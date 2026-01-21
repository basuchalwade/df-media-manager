import React, { useEffect, useState } from 'react';
import { Save, Server, Cpu, CheckCircle, AlertTriangle, Key } from 'lucide-react';
import { store } from '../services/mockStore';
import { UserSettings } from '../types';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    store.getSettings().then(setSettings);
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await store.saveSettings(settings);
      setMessage({ text: 'Settings saved successfully', type: 'success' });
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ text: 'Failed to save settings', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateApiKey = (key: string) => {
    if (!settings) return;
    setSettings({ ...settings, geminiApiKey: key });
  };

  const toggleDemoMode = () => {
    if (!settings) return;
    setSettings({ ...settings, demoMode: !settings.demoMode });
  };

  if (!settings) return <div className="p-8 text-slate-500">Loading settings...</div>;

  return (
    <div className="space-y-6 pb-12">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
          <p className="text-slate-500">Manage global configurations, API keys, and system preferences.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </header>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* System Mode */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
            <Server className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">System Mode</h3>
            <p className="text-sm text-slate-500 mb-4">Toggle between simulation mode and live production API calls.</p>
            
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDemoMode}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                  settings.demoMode ? 'bg-orange-400' : 'bg-green-600'
                }`}
              >
                <span className="sr-only">Toggle Demo Mode</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.demoMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${settings.demoMode ? 'text-orange-600' : 'text-green-600'}`}>
                {settings.demoMode ? 'Demo Mode (Mock Backend)' : 'Live Mode (Real APIs Enabled)'}
              </span>
            </div>
            
            {!settings.demoMode && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5" />
                Warning: Live mode will post content to your actual social media accounts. Ensure your content is reviewed.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* AI Configuration */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
            <Cpu className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">AI Content Engine</h3>
            <p className="text-sm text-slate-500 mb-4">Configure Gemini API for content generation.</p>
            
            <div className="max-w-xl">
              <label className="block text-sm font-medium text-slate-700 mb-1">Gemini API Key</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={settings.geminiApiKey}
                  onChange={(e) => updateApiKey(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="AIza..."
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Key is stored locally in browser storage for demo purposes. In production, this would be encrypted on the server.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <div className="text-center text-sm text-slate-400 mt-8">
        Looking to connect your social accounts? Go to the <strong>Integrations</strong> tab.
      </div>
    </div>
  );
};
