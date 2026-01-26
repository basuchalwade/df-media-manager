
import { useState, useEffect } from 'react';
import { store } from '../services/mockStore';
import { PlatformConfig, Platform } from '../types';

export const usePlatforms = () => {
  const [platforms, setPlatforms] = useState<PlatformConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlatforms();
    
    // Subscribe to changes (simple polling for mock)
    const interval = setInterval(fetchPlatforms, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchPlatforms = async () => {
    const data = await store.getPlatforms();
    setPlatforms(data);
    setLoading(false);
  };

  const getPlatform = (id: Platform) => platforms.find(p => p.id === id);

  const getActivePlatforms = () => platforms.filter(p => p.enabled && p.connected && !p.outage);

  return {
    platforms,
    loading,
    getPlatform,
    getActivePlatforms
  };
};
