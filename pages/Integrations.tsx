import React, { useEffect, useState } from 'react';
import { Link, CheckCircle, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { store } from '../services/mockStore';
import { Platform, User } from '../types';
import { PlatformIcon } from '../components/PlatformIcon';

export const Integrations: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [loadingMap, setLoadingMap] = useState<{ [key in Platform]?: boolean }>({});

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await store.getCurrentUser();
    setCurrentUser(user);
  };

  const handleToggleConnection = async (platform: Platform) => {
    setLoadingMap(prev => ({ ...prev, [platform]: true }));
    
    // Simulate OAuth Delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await store.togglePlatformConnection(platform);
    await loadUser();
    
    setLoadingMap(prev => ({ ...prev, [platform]: false }));
  };

  if (!currentUser) return <div className="p-8 text-slate-500">Loading user profile...</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Link className="w-6 h-6 text-blue-600" />
          My Integrations
        </h1>
        <p className="text-slate-500">
          Connect your personal social media accounts. These connections are private to you ({currentUser.name}).
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(Platform).map((platform) => {
          const connection = currentUser.connectedAccounts[platform];
          const isConnected = connection?.connected;
          const isLoading = loadingMap[platform];

          return (
            <div 
              key={platform} 
              className={`relative overflow-hidden rounded-xl border p-6 transition-all ${
                isConnected 
                  ? 'bg-white border-blue-200 shadow-sm' 
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-slate-100 to-transparent rounded-full opacity-50 pointer-events-none"></div>

              <div className="flex items-start justify-between mb-6 relative">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                  <PlatformIcon platform={platform} size={32} />
                </div>
                {isConnected && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Connected
                  </div>
                )}
              </div>

              <div className="relative">
                <h3 className="text-lg font-bold text-slate-900">{platform}</h3>
                
                {isConnected ? (
                  <div className="mt-1 mb-6">
                    <p className="text-sm font-medium text-slate-600">{connection.handle}</p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> Last synced: {connection.lastSync}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 mt-1 mb-6">
                    Connect your {platform} account to automate posts and track analytics.
                  </p>
                )}

                <button
                  onClick={() => handleToggleConnection(platform)}
                  disabled={isLoading}
                  className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                    isConnected
                      ? 'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-600 hover:border-red-100'
                      : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-200'
                  } ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {isConnected ? 'Disconnecting...' : 'Connecting...'}
                    </>
                  ) : isConnected ? (
                    'Disconnect Account'
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Connect {platform}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 text-sm text-blue-800">
        <AlertCircle className="w-5 h-5 shrink-0 text-blue-600" />
        <div>
          <h4 className="font-semibold mb-1">Privacy Note</h4>
          <p className="opacity-90">
            These connections are linked uniquely to your user profile (<strong>{currentUser.email}</strong>). 
            Other users in your organization cannot post to these accounts unless they are also admins of the pages directly on the social platforms.
          </p>
        </div>
      </div>
    </div>
  );
};