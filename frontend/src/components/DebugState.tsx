
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Activity, Server } from 'lucide-react';

export const DebugState: React.FC = () => {
    const [state, setState] = useState<any>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const interval = setInterval(async () => {
            // Poll backend state if open or in dev
            if (open || (import.meta as any).env.DEV) {
                try {
                    const data = await api.getDebugState();
                    setState(data);
                } catch (e) {
                    console.warn("Debug API unreachable");
                }
            }
        }, 1500); // 1.5s update rate for liveliness
        return () => clearInterval(interval);
    }, [open]);

    // Only show in development
    if (!(import.meta as any).env.DEV) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999]">
            {!open ? (
                <button 
                    onClick={() => setOpen(true)}
                    className="bg-black/90 text-green-400 p-2 rounded-full shadow-lg border border-green-500/50 hover:bg-black transition-colors font-mono text-xs flex items-center gap-2"
                    title="Open Debug Verification"
                >
                    <Server size={14} /> DEBUG
                </button>
            ) : (
                <div className="bg-black/95 text-green-400 p-4 rounded-xl shadow-2xl w-80 font-mono text-[10px] border border-green-500/50">
                    <div className="flex justify-between items-center mb-3 border-b border-green-900/50 pb-2">
                        <span className="font-bold flex items-center gap-2"><Server size={12} /> BACKEND STATE</span>
                        <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white">✕</button>
                    </div>
                    {state ? (
                        <div className="space-y-3">
                            <div>
                                <span className="text-white/60 block mb-1">PLATFORMS (Registry):</span>
                                <div className="flex flex-wrap gap-1">
                                    {state.activePlatforms?.map((p: string) => (
                                        <span key={p} className="bg-green-900/50 px-1.5 py-0.5 rounded text-green-300">{p}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="text-white/60 block mb-1">CONNECTIONS (User):</span>
                                <div className="flex flex-col gap-1">
                                    {Object.entries(state.userConnections || {}).map(([k, v]: any) => (
                                        v.connected ? (
                                            <span key={k} className="text-blue-400 flex items-center gap-1">
                                                <span>✓</span> {k}
                                            </span>
                                        ) : null
                                    ))}
                                    {Object.values(state.userConnections || {}).every((v: any) => !v.connected) && (
                                        <span className="text-red-400 italic">No connections</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-green-900/50">
                                <span>Bots: {state.bots?.length || 0}</span>
                                <span>Sync: {new Date(state.timestamp).toLocaleTimeString()}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-yellow-500">
                            <Activity className="animate-spin" size={12} /> Connecting to API...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
