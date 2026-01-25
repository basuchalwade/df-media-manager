
import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, RefreshCw, Plus } from 'lucide-react';
import { api } from '../services/api';
import { Platform, User } from '../types';
import { PlatformIcon } from '../components/PlatformIcon';

export const Integrations: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [loadingMap, setLoadingMap] = useState<{ [key in Platform]?: boolean }>({});

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await api.getCurrentUser();
    setCurrentUser(user);
  };

  const handleToggleConnection = async (platform: Platform) => {
    setLoadingMap(prev => ({ ...prev, [platform]: true }));
    await api.togglePlatformConnection(platform);
    await loadUser();
    setLoadingMap(prev => ({ ...prev, [platform]: false }));
  };

  if (!currentUser) return <div className="p-8 text-slate-500">Loading user profile...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Integrations</h1>
        <p className="text-slate-500 font-medium mt-1">
          Manage your connected social accounts.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.values(Platform).map((platform) => {
          const connection = currentUser.connectedAccounts[platform];
          const isConnected = connection?.connected;
          const isLoading = loadingMap[platform];

          return (
            <div 
              key={platform} 
              className={`relative flex flex-col justify-between p-6 rounded-3xl border transition-all duration-300 group ${
                isConnected 
                  ? 'bg-white border-slate-200 shadow-sm' 
                  : 'bg-white border-slate-100 opacity-90'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors ${isConnected ? 'bg-white border-slate-100' : 'bg-slate-50 border-slate-100'}`}>
                    <PlatformIcon platform={platform} size={28} />
                  </div>
                  <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${isConnected ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{platform === Platform.Twitter ? 'X' : platform}</h3>
                
                {isConnected ? (
                  <div className="mt-1">
                     <p className="text-sm font-semibold text-blue-600">{connection.handle}</p>
                     <p className="text-xs text-slate-400 mt-2 font-medium">Synced {new Date(connection.lastSync!).toLocaleDateString()}</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Connect to automate publishing.
                  </p>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={() => handleToggleConnection(platform)}
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                    isConnected
                      ? 'bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 border border-slate-100'
                      : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800'
                  }`}
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : isConnected ? (
                    'Disconnect'
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Connect
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
