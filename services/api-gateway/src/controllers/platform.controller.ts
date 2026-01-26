
import { Request, Response } from 'express';
import { mockDb, PLATFORM_REGISTRY } from '../data/mockDb';

export const getPlatforms = (req: any, res: any) => {
  const user = mockDb.users[0]; // In prod use req.user
  
  // Merge Static Registry with Dynamic User State
  const enrichedPlatforms = PLATFORM_REGISTRY.map(p => {
    const connection = user.connectedAccounts[p.id];
    return {
      ...p,
      // Overwrite connected status based on real DB/MockDB state
      connected: !!connection?.connected
    };
  });

  res.json(enrichedPlatforms);
};

export const getDebugState = (req: any, res: any) => {
    res.json({
        timestamp: new Date().toISOString(),
        registrySize: PLATFORM_REGISTRY.length,
        activePlatforms: PLATFORM_REGISTRY.filter(p => p.enabled).map(p => p.id),
        userConnections: mockDb.users[0].connectedAccounts,
        bots: mockDb.bots.map(b => ({ type: b.type, status: b.status, enabled: b.enabled })),
        campaignCount: mockDb.campaigns.length
    });
};
