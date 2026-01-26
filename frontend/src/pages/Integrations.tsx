
import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, RefreshCw, Plus } from 'lucide-react';
import { store } from '../services/mockStore';
import { Platform } from '../types';
import { PlatformIcon } from '../components/PlatformIcon';
import { usePlatforms } from '../hooks/usePlatforms';

export const Integrations: React.FC = () => {
  const [loadingMap, setLoadingMap] = useState<{ [key in Platform]?: boolean }>({});
  
  // Use the Centralized Registry Hook (Source of Truth)
  const { platforms, loading: platformsLoading } = usePlatforms();

  const handleToggleConnection = async (platform: Platform) => {
    setLoadingMap(prev => ({ ...prev, [platform]: true }));
    // Simulate network delay for effect
    await new Promise(resolve => setTimeout(resolve, 500));
    // Trigger backend toggle -> this will update User state -> then refresh platforms
    await store.togglePlatformConnection(platform);
    setLoadingMap(prev => ({ ...prev, [platform]: false }));
  };

  if (platformsLoading && platforms.length === 0) return <div className="p-8 text-slate-500">Loading integrations...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Integrations</h1>
        <p className="text-slate-500 font-medium mt-1">
          Manage your connected social accounts and API gateways.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {platforms.map((platformConfig) => {
          // Check actual connection status from Registry (which merges User state)
          const isConnected = platformConfig.connected;
          const isLoading = loadingMap[platformConfig.id];
          
          return (
            <div 
              key={platformConfig.id} 
              className={`relative flex flex-col justify-between p-6 rounded-3xl border transition-all duration-300 group ${
                isConnected 
                  ? 'bg-white border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)]' 
                  : 'bg-white border-slate-100 opacity-90 hover:opacity-100 hover:shadow-md hover:border-slate-200'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors ${isConnected ? 'bg-white border-slate-100' : 'bg-slate-50 border-slate-100'}`}>
                    <PlatformIcon platform={platformConfig.id} size={28} />
                  </div>
                  <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${isConnected ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{platformConfig.name}</h3>
                
                {isConnected ? (
                  <div className="mt-1">
                     <p className="text-sm font-semibold text-blue-600">@demo_handle</p>
                     <p className="text-xs text-slate-400 mt-2 font-medium">Active & Syncing</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Connect to automate publishing and analytics.
                  </p>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={() => handleToggleConnection(platformConfig.id)}
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
