
import React, { useEffect, useState } from 'react';
import { Save, Server, CheckCircle, AlertTriangle, ChevronRight, Globe, Shield, Bell, Lock, User as UserIcon, Briefcase, Zap, Link as LinkIcon, CreditCard, Terminal, LogOut, Smartphone, AlertOctagon, RotateCcw, Cloud, Activity, Database } from 'lucide-react';
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
    setOriginalSettings(JSON.parse(JSON.stringify(s))); // Deep copy
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

  const updateNestedSetting = (section: keyof UserSettings, subSection: string, key: string, value: any) => {
    if (!settings) return;
    setSettings(prev => {
        if (!prev) return null;
        // @ts-ignore - Complexity of nested generic types for UserSettings
        const currentSection = prev[section] as any;
        return {
            ...prev,
            [section]: {
                ...currentSection,
                [subSection]: {
                    ...currentSection[subSection],
                    [key]: value
                }
            }
        };
    });
  };

  if (!settings || !currentUser) return <div className="p-8 text-slate-400">Loading settings...</div>;

  // Render Helpers
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
      
      {/* 1. Sidebar Navigation */}
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

      {/* 2. Main Content Area */}
      <div className="flex-1 max-w-3xl pb-24">
         
         {/* -- WORKSPACE -- */}
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
                            {!settings.demoMode && (
                                <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-green-700">
                                    <Database className="w-3 h-3" />
                                    <span>Database Connected: postgresql/production</span>
                                </div>
                            )}
                        </div>
                        <Toggle 
                           label="Enable Simulation Mode" 
                           description="Switch to local mock data. Unsaved production work will not be carried over."
                           checked={settings.demoMode}
                           onChange={(v: boolean) => updateSetting('demoMode', '', v)}
                        />
                    </div>
                    
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                             <Globe className="w-5 h-5 text-blue-500" />
                             <h3 className="font-bold text-slate-900">Localization</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
                                <select 
                                    value={settings.workspace.timezone}
                                    onChange={(e) => updateSetting('workspace', 'timezone', e.target.value)}
                                    className="w-full bg-white text-slate-900 rounded-lg border-slate-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>{Intl.DateTimeFormat().resolvedOptions().timeZone} (System)</option>
                                    <option value="America/New_York">Eastern Time (US & Canada)</option>
                                    <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                                    <option value="Europe/London">London</option>
                                    <option value="Asia/Tokyo">Tokyo</option>
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Used for scheduling all posts.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Default Content Tone</label>
                                <select 
                                    value={settings.workspace.defaultTone}
                                    onChange={(e) => updateSetting('workspace', 'defaultTone', e.target.value)}
                                    className="w-full bg-white text-slate-900 rounded-lg border-slate-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option>Professional</option>
                                    <option>Casual</option>
                                    <option>Witty</option>
                                    <option>Urgent</option>
                                </select>
                            </div>
                        </div>
                    </div>
                 </Card>
             </div>
         )}

         {/* ... Other tabs remain largely the same, handled by the default rendering below ... */}
         
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Display Language</label>
                            <select 
                                value={settings.general.language}
                                onChange={(e) => updateSetting('general', 'language', e.target.value)}
                                className="w-full bg-white text-slate-900 rounded-lg border-slate-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option>English (US)</option>
                                <option>English (UK)</option>
                                <option>Spanish</option>
                                <option>French</option>
                                <option>German</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date Format</label>
                            <select 
                                value={settings.general.dateFormat}
                                onChange={(e) => updateSetting('general', 'dateFormat', e.target.value)}
                                className="w-full bg-white text-slate-900 rounded-lg border-slate-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">First Day of Week</label>
                            <select 
                                value={settings.general.startOfWeek}
                                onChange={(e) => updateSetting('general', 'startOfWeek', e.target.value)}
                                className="w-full bg-white text-slate-900 rounded-lg border-slate-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="Monday">Monday</option>
                                <option value="Sunday">Sunday</option>
                            </select>
                        </div>
                    </div>
                 </Card>
             </div>
         )}

         {/* -- NOTIFICATIONS -- */}
         {activeTab === 'notifications' && (
             <div className="space-y-6">
                 <SectionTitle title="Notifications" description="Choose how and when you want to be alerted." />

                 <Card className="p-6">
                     <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Delivery Channels</h3>
                     <Toggle 
                        label="Email Notifications" 
                        description="Receive digests and critical alerts via email."
                        checked={settings.notifications.channels.email}
                        onChange={(v: boolean) => updateNestedSetting('notifications', 'channels', 'email', v)}
                     />
                     <Toggle 
                        label="In-App Notifications" 
                        description="Show badges and toasts within the dashboard."
                        checked={settings.notifications.channels.inApp}
                        onChange={(v: boolean) => updateNestedSetting('notifications', 'channels', 'inApp', v)}
                     />
                      <Toggle 
                        label="Slack / Webhook" 
                        description="Forward alerts to a configured webhook URL."
                        checked={settings.notifications.channels.slack}
                        onChange={(v: boolean) => updateNestedSetting('notifications', 'channels', 'slack', v)}
                     />
                 </Card>

                 <Card className="p-6">
                     <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Alert Types</h3>
                     <Toggle 
                        label="Bot Activity" 
                        checked={settings.notifications.alerts.botActivity}
                        onChange={(v: boolean) => updateNestedSetting('notifications', 'alerts', 'botActivity', v)}
                     />
                     <Toggle 
                        label="Publishing Failures" 
                        checked={settings.notifications.alerts.failures}
                        onChange={(v: boolean) => updateNestedSetting('notifications', 'alerts', 'failures', v)}
                     />
                     <Toggle 
                        label="Approval Requests" 
                        checked={settings.notifications.alerts.approvals}
                        onChange={(v: boolean) => updateNestedSetting('notifications', 'alerts', 'approvals', v)}
                     />
                 </Card>
             </div>
         )}

         {/* -- SECURITY -- */}
         {activeTab === 'security' && (
             <div className="space-y-6">
                 <SectionTitle title="Security" description="Protect your account and organization data." />

                 <Card className="p-6 divide-y divide-slate-100">
                     <div className="pb-4">
                        <Toggle 
                            label="Two-Factor Authentication (2FA)" 
                            description="Require an authenticator code when logging in."
                            checked={settings.security.twoFactorEnabled}
                            onChange={(v: boolean) => updateSetting('security', 'twoFactorEnabled', v)}
                        />
                     </div>
                     <div className="pt-4 pb-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="text-sm font-semibold text-gray-900">Session Timeout</div>
                                <div className="text-xs text-gray-500 mt-1">Force logout inactive users after this period.</div>
                            </div>
                            <select 
                                value={settings.security.sessionTimeout}
                                onChange={(e) => updateSetting('security', 'sessionTimeout', e.target.value)}
                                className="bg-white text-slate-900 rounded-lg border-slate-300 text-sm focus:ring-blue-500"
                            >
                                <option value="15m">15 Minutes</option>
                                <option value="30m">30 Minutes</option>
                                <option value="1h">1 Hour</option>
                                <option value="4h">4 Hours</option>
                            </select>
                        </div>
                     </div>
                     <div className="pt-4">
                        <h4 className="text-sm font-bold text-slate-900 mb-3">Active Sessions</h4>
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <Smartphone className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs font-bold text-slate-700">Chrome on macOS (Current)</p>
                                    <p className="text-[10px] text-slate-400">San Francisco, US • 192.168.1.1</p>
                                </div>
                            </div>
                            <div className="text-xs text-green-600 font-bold px-2 py-1 bg-green-50 rounded">Active</div>
                        </div>
                         <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Smartphone className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs font-bold text-slate-700">Safari on iPhone</p>
                                    <p className="text-[10px] text-slate-400">San Francisco, US • 2 hours ago</p>
                                </div>
                            </div>
                            <button className="text-xs text-red-600 hover:underline">Revoke</button>
                        </div>
                     </div>
                 </Card>

                 <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                         <Shield className="w-5 h-5 text-blue-600" />
                         <div>
                             <h4 className="font-bold text-blue-900 text-sm">Security Audit Log</h4>
                             <p className="text-xs text-blue-700">View recent sensitive actions.</p>
                         </div>
                     </div>
                     <button onClick={() => setSecurityLogOpen(!securityLogOpen)} className="text-xs font-bold bg-white text-blue-700 px-3 py-2 rounded-lg border border-blue-200 shadow-sm">
                         {securityLogOpen ? 'Hide Log' : 'View Log'}
                     </button>
                 </div>
                 
                 {securityLogOpen && (
                     <Card className="overflow-hidden animate-in slide-in-from-top-2">
                         <table className="w-full text-left text-sm">
                             <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                                 <tr>
                                     <th className="px-4 py-2">Event</th>
                                     <th className="px-4 py-2">User</th>
                                     <th className="px-4 py-2">Date</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100 text-slate-700">
                                 <tr>
                                     <td className="px-4 py-2">Settings Updated</td>
                                     <td className="px-4 py-2">Admin User</td>
                                     <td className="px-4 py-2 text-slate-400">Just now</td>
                                 </tr>
                                 <tr>
                                     <td className="px-4 py-2">Bot Config Change</td>
                                     <td className="px-4 py-2">Sarah Monitor</td>
                                     <td className="px-4 py-2 text-slate-400">2 hours ago</td>
                                 </tr>
                                 <tr>
                                     <td className="px-4 py-2">Login</td>
                                     <td className="px-4 py-2">Admin User</td>
                                     <td className="px-4 py-2 text-slate-400">1 day ago</td>
                                 </tr>
                             </tbody>
                         </table>
                     </Card>
                 )}
             </div>
         )}
         
         {/* -- INTEGRATIONS -- */}
         {activeTab === 'integrations' && (
             <div className="space-y-6">
                 <SectionTitle title="Integrations" description="Manage platform connections and API permissions." />
                 
                 <div className="grid grid-cols-1 gap-4">
                     {Object.values(Platform).map(p => {
                        const isConnected = currentUser.connectedAccounts[p]?.connected;
                        return (
                            <Card key={p} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isConnected ? 'bg-slate-50' : 'bg-slate-100 grayscale'}`}>
                                        <PlatformIcon platform={p} size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{p === Platform.Twitter ? 'X (Twitter)' : p}</h3>
                                        <p className="text-xs text-slate-500">
                                            {isConnected 
                                              ? `Connected as ${currentUser.connectedAccounts[p]?.handle}` 
                                              : 'Not connected'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {isConnected && <div className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-full font-bold border border-green-100">Active</div>}
                                    <button className="text-sm font-semibold text-slate-600 hover:text-blue-600">Configure</button>
                                </div>
                            </Card>
                        );
                     })}
                 </div>
             </div>
         )}

         {/* -- AUTOMATION -- */}
         {activeTab === 'automation' && (
             <div className="space-y-6">
                 <SectionTitle title="Automation Defaults" description="Set global rules for all autonomous agents." />
                 
                 <Card className="p-6">
                     <h3 className="font-bold text-slate-900 mb-4">Global Safety Standards</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                        {['Conservative', 'Moderate', 'Aggressive'].map((level) => (
                            <button
                                key={level}
                                onClick={() => updateSetting('automation', 'globalSafetyLevel', level)}
                                className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                                    settings.automation.globalSafetyLevel === level 
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500 shadow-sm' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                            >
                                {level}
                            </button>
                        ))}
                     </div>
                     <p className="text-xs text-slate-500 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
                         {settings.automation.globalSafetyLevel === 'Conservative' && "Strict content filtering, lower daily limits. Best for new accounts."}
                         {settings.automation.globalSafetyLevel === 'Moderate' && "Balanced limits and standard content filtering. Recommended for established accounts."}
                         {settings.automation.globalSafetyLevel === 'Aggressive' && "Higher limits, minimal filtering. Use with caution for rapid growth."}
                     </p>

                     <div className="border-t border-slate-100 pt-6">
                        <h3 className="font-bold text-slate-900 mb-4">Default Working Hours</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Time</label>
                                <input 
                                    type="time" 
                                    value={settings.automation.defaultWorkHours.start}
                                    onChange={(e) => updateNestedSetting('automation', 'defaultWorkHours', 'start', e.target.value)}
                                    className="w-full bg-white text-slate-900 rounded-lg border-slate-300 text-sm focus:ring-blue-500 focus:border-blue-500" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Time</label>
                                <input 
                                    type="time" 
                                    value={settings.automation.defaultWorkHours.end}
                                    onChange={(e) => updateNestedSetting('automation', 'defaultWorkHours', 'end', e.target.value)}
                                    className="w-full bg-white text-slate-900 rounded-lg border-slate-300 text-sm focus:ring-blue-500 focus:border-blue-500" 
                                />
                            </div>
                        </div>
                     </div>
                 </Card>
             </div>
         )}
         
         {/* -- BILLING -- */}
         {activeTab === 'billing' && (
             <div className="space-y-6">
                 <SectionTitle title="Billing & Plan" description="Manage subscription and usage." />
                 
                 <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg">
                     <div className="flex justify-between items-start mb-6">
                         <div>
                             <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Current Plan</p>
                             <h3 className="text-3xl font-bold mt-1">Enterprise Pro</h3>
                         </div>
                         <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold border border-white/20">Active</div>
                     </div>
                     <div className="space-y-4">
                         <div>
                             <div className="flex justify-between text-sm mb-1">
                                 <span className="text-slate-300">Bot Actions</span>
                                 <span className="font-mono">14,203 / 50,000</span>
                             </div>
                             <div className="w-full bg-white/10 rounded-full h-2">
                                 <div className="bg-blue-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                             </div>
                         </div>
                         <div>
                             <div className="flex justify-between text-sm mb-1">
                                 <span className="text-slate-300">Storage</span>
                                 <span className="font-mono">4.2 GB / 10 GB</span>
                             </div>
                             <div className="w-full bg-white/10 rounded-full h-2">
                                 <div className="bg-purple-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                             </div>
                         </div>
                     </div>
                     <div className="mt-6 pt-6 border-t border-white/10 flex gap-3">
                         <button className="px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-bold hover:bg-slate-100">Upgrade Plan</button>
                         <button className="px-4 py-2 bg-transparent border border-white/20 text-white rounded-lg text-sm font-bold hover:bg-white/5">View Invoices</button>
                     </div>
                 </div>
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

                 <div className="border border-red-200 bg-red-50 rounded-2xl p-6">
                     <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                         <AlertOctagon className="w-5 h-5" /> Danger Zone
                     </h3>
                     <p className="text-sm text-red-700 mb-4">
                         Irreversible actions. Please proceed with caution.
                     </p>
                     <div className="flex flex-wrap gap-3">
                         <button className="px-4 py-2 bg-white border border-red-200 text-red-600 font-bold text-xs rounded-lg hover:bg-red-50">
                             Reset Workspace
                         </button>
                         <button className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-lg hover:bg-red-700">
                             Delete Organization
                         </button>
                     </div>
                 </div>
             </div>
         )}

      </div>

      {/* Sticky Save Bar */}
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
      
      {/* Toast Message */}
      {message && (
          <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2 fade-in ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              <span className="text-sm font-bold">{message.text}</span>
          </div>
      )}

    </div>
  );
};
