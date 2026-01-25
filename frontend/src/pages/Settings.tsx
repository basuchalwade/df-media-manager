
import React, { useEffect, useState } from 'react';
import { Server, CheckCircle, AlertTriangle, Globe, Shield, Bell, Lock, User as UserIcon, Briefcase, Zap, Link as LinkIcon, CreditCard, Terminal, Smartphone, AlertOctagon, RotateCcw, Database } from 'lucide-react';
import { store } from '../services/mockStore';
import { UserSettings, Platform, User } from '../types';
import { PlatformIcon } from '../components/PlatformIcon';

type SettingsTab = 'general' | 'workspace' | 'notifications' | 'security' | 'integrations' | 'automation' | 'billing' | 'advanced';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<UserSettings | null>(null);
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [securityLogOpen, setSecurityLogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const s = await store.getSettings();
    const u = await store.getCurrentUser();
    setSettings(s);
    setOriginalSettings(JSON.parse(JSON.stringify(s)));
    setCurrentUser(u);
  };

  useEffect(() => {
    if (settings && originalSettings) {
      setIsDirty(JSON.stringify(settings) !== JSON.stringify(originalSettings));
    }
  }, [settings, originalSettings]);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await store.saveSettings(settings);
      setOriginalSettings(JSON.parse(JSON.stringify(settings)));
      setIsDirty(false);
      setMessage({ text: 'Changes saved successfully', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ text: 'Failed to save settings', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (section: keyof UserSettings, key: string, value: any) => {
    if (!settings) return;
    setSettings(prev => {
      if (!prev) return null;
      if (section === 'demoMode' || section === 'geminiApiKey') {
          return { ...prev, [section]: value };
      }
      return {
        ...prev,
        [section]: {
          ...(prev[section] as object),
          [key]: value
        }
      };
    });
  };

  if (!settings || !currentUser) return <div className="p-8 text-slate-400">Loading settings...</div>;

  const Toggle = ({ checked, onChange, label, description }: any) => (
    <div className="flex items-center justify-between py-4">
       <div>
         <div className="text-sm font-semibold text-gray-900">{label}</div>
         {description && <div className="text-xs text-gray-500 mt-1">{description}</div>}
       </div>
       <button 
         onClick={() => onChange(!checked)}
         className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
       >
         <span className={`inline-block w-4 h-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-1'} mt-1`} />
       </button>
    </div>
  );

  const SectionTitle = ({ title, description }: any) => (
      <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
  );

  const Card = ({ children, className = "" }: any) => (
      <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
          {children}
      </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[80vh] animate-in fade-in duration-500">
      
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 flex-shrink-0 space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 px-3 mb-6 tracking-tight">Settings</h1>
        
        {[
            { id: 'general', label: 'General', icon: UserIcon },
            { id: 'workspace', label: 'Workspace', icon: Briefcase },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'integrations', label: 'Integrations', icon: LinkIcon },
            { id: 'automation', label: 'Automation', icon: Zap },
            { id: 'billing', label: 'Billing', icon: CreditCard },
            { id: 'advanced', label: 'Advanced', icon: Terminal },
        ].map((item) => (
            <button
                key={item.id}
                onClick={() => setActiveTab(item.id as SettingsTab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id 
                    ? 'bg-slate-100 text-slate-900' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
            >
                <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'}`} />
                {item.label}
            </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 max-w-3xl pb-24">
         {activeTab === 'workspace' && (
             <div className="space-y-6">
                 <SectionTitle title="Workspace Environment" description="Configure global settings for your team." />
                 
                 <Card className="divide-y divide-slate-100">
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                             <Server className={`w-5 h-5 ${settings.demoMode ? 'text-orange-500' : 'text-green-500'}`} />
                             <h3 className="font-bold text-slate-900">Environment Mode</h3>
                        </div>
                        <div className={`border rounded-xl p-4 mb-4 ${settings.demoMode ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'}`}>
                            <p className={`text-sm leading-relaxed ${settings.demoMode ? 'text-orange-800' : 'text-green-800'}`}>
                                {settings.demoMode 
                                    ? <span><strong>Simulation Mode:</strong> Using local mock database. No real API calls are being made. Ideal for testing.</span>
                                    : <span><strong>Production Mode:</strong> Connected to PostgreSQL. Real API calls are enabled. All changes are persistent.</span>
                                }
                            </p>
                        </div>
                        <Toggle 
                           label="Enable Simulation Mode" 
                           description="Switch to local mock data. Unsaved production work will not be carried over."
                           checked={settings.demoMode}
                           onChange={(v: boolean) => updateSetting('demoMode', '', v)}
                        />
                    </div>
                 </Card>
             </div>
         )}
         
         {/* -- GENERAL -- */}
         {activeTab === 'general' && (
             <div className="space-y-6">
                 <SectionTitle title="General" description="Manage your profile and display preferences." />
                 <Card className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                            {currentUser.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">{currentUser.name}</h3>
                            <p className="text-sm text-slate-500">{currentUser.email}</p>
                            <p className="text-xs font-semibold text-blue-600 mt-1 uppercase">{currentUser.role}</p>
                        </div>
                    </div>
                 </Card>
             </div>
         )}

         {/* -- ADVANCED -- */}
         {activeTab === 'advanced' && (
             <div className="space-y-6">
                 <SectionTitle title="Advanced Settings" description="Developer tools and danger zone." />
                 <Card className="p-6">
                     <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                         <Terminal className="w-4 h-4" /> API Configuration
                     </h3>
                     <div className="space-y-4">
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Gemini API Key</label>
                             <input 
                                 type="password" 
                                 value={settings.geminiApiKey}
                                 onChange={(e) => updateSetting('geminiApiKey', '', e.target.value)}
                                 className="w-full rounded-lg border-slate-300 text-sm font-mono"
                                 placeholder="AIza..."
                             />
                             <p className="text-xs text-slate-500 mt-1">Required for content generation and AI features.</p>
                         </div>
                     </div>
                 </Card>
             </div>
         )}
      </div>

      {isDirty && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in">
              <div className="bg-[#1d1d1f] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 border border-gray-700">
                  <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                      <span className="text-sm font-bold">Unsaved Changes</span>
                  </div>
                  <div className="h-4 w-px bg-gray-600"></div>
                  <div className="flex gap-2">
                      <button 
                         onClick={() => {
                             setSettings(JSON.parse(JSON.stringify(originalSettings)));
                             setIsDirty(false);
                         }}
                         className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors"
                      >
                          Reset
                      </button>
                      <button 
                         onClick={handleSave}
                         disabled={isSaving}
                         className="px-4 py-1.5 bg-white text-black rounded-full text-xs font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
                      >
                         {isSaving && <RotateCcw className="w-3 h-3 animate-spin" />}
                         Save Changes
                      </button>
                  </div>
              </div>
          </div>
      )}
      
      {message && (
          <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2 fade-in ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              <span className="text-sm font-bold">{message.text}</span>
          </div>
      )}
    </div>
  );
};
