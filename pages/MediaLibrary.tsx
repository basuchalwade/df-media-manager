
import React, { useState, useEffect, useRef } from 'react';
import { 
  Image as ImageIcon, UploadCloud, Trash2, Download, X, Search, 
  Folder, Plus, Tag, LayoutGrid, List, Play, FileVideo, Info,
  Loader2, AlertTriangle, CheckCircle, Shield, BrainCircuit, Clock,
  History, RotateCcw, FileText, Smartphone
} from 'lucide-react';
import { store } from '../services/mockStore';
import { MediaItem, MediaAuditEvent } from '../types';
import { getAuditForMedia } from '../services/auditStore';
import { PLATFORM_RULES } from '../services/platformRules';
import { PlatformIcon } from '../components/PlatformIcon';

interface Collection {
  id: string;
  name: string;
  count: number;
  type: 'campaign' | 'pool';
}

const COLLECTIONS: Collection[] = [
  { id: 'c1', name: 'Q3 Product Launch', count: 12, type: 'campaign' },
  { id: 'c2', name: 'Evergreen Memes', count: 45, type: 'pool' },
  { id: 'c3', name: 'Holiday Special', count: 8, type: 'campaign' },
  { id: 'c4', name: 'CEO Thought Leadership', count: 15, type: 'pool' },
];

export const MediaLibrary: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>(COLLECTIONS);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeCollection, setActiveCollection] = useState<string>('all');
  const [activePlatformFilter, setActivePlatformFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [auditLogs, setAuditLogs] = useState<MediaAuditEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'audit'>('details');
  const [platformCounts, setPlatformCounts] = useState<Record<string, number>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
    const interval = setInterval(loadMedia, 2000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterMedia();
    calculatePlatformCounts();
  }, [mediaItems, searchQuery, activeCollection, activePlatformFilter]);

  useEffect(() => {
    if (selectedItem && isDrawerOpen) {
      // Refresh audit logs when selection changes or drawer opens
      setAuditLogs(getAuditForMedia(selectedItem.id));
    }
  }, [selectedItem, isDrawerOpen]);

  const loadMedia = async () => {
    const rawItems = await store.getMedia();
    setMediaItems(rawItems);
    
    if (selectedItem) {
        const updatedSelected = rawItems.find(i => i.id === selectedItem.id);
        if (updatedSelected) {
            // Keep selected item fresh but don't override local input state if we were typing rejection reason
            if (updatedSelected.processingStatus !== selectedItem.processingStatus || 
                updatedSelected.governance.status !== selectedItem.governance.status) {
                setSelectedItem(updatedSelected);
                // Also refresh audit logs if governance changed
                setAuditLogs(getAuditForMedia(updatedSelected.id));
            }
        }
    }
  };

  const calculatePlatformCounts = () => {
    const counts: Record<string, number> = {};
    Object.values(PLATFORM_RULES).forEach(rule => {
        counts[rule.id] = mediaItems.filter(item => 
            item.platformCompatibility?.[rule.id]?.compatible
        ).length;
    });
    setPlatformCounts(counts);
  };

  const filterMedia = () => {
    let result = [...mediaItems];

    if (activeCollection !== 'all') {
      result = result.filter(item => item.collections?.includes(activeCollection));
    }

    if (activePlatformFilter) {
        result = result.filter(item => item.platformCompatibility?.[activePlatformFilter]?.compatible);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    setFilteredItems(result);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files) as File[];
    for (const file of files) {
        try {
            await store.uploadMedia(file);
        } catch (err) {
            console.error(err);
        }
    }
    await loadMedia();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this asset?')) {
        try {
            await store.deleteMedia(id);
            setSelectedItem(null);
            setIsDrawerOpen(false);
            await loadMedia();
        } catch (e: any) {
            alert(e.message);
        }
    }
  };

  const handleApprove = async () => {
      if (!selectedItem) return;
      await store.approveMedia(selectedItem.id, 'Admin User');
      await loadMedia();
  };

  const handleReject = async () => {
      if (!selectedItem) return;
      if (!rejectionReason) {
          alert("Please provide a reason for rejection.");
          return;
      }
      await store.rejectMedia(selectedItem.id, rejectionReason);
      setRejectionReason('');
      await loadMedia();
  };

  const handleReset = async () => {
      if (!selectedItem) return;
      await store['resetMedia'](selectedItem.id);
      await loadMedia();
  };

  const handleAssetClick = (item: MediaItem) => {
      setSelectedItem(item);
      setIsDrawerOpen(true);
      setRejectionReason('');
      setActiveTab('details');
      setAuditLogs(getAuditForMedia(item.id));
  };

  const getActionColor = (action: string) => {
      switch(action) {
          case 'APPROVED': return 'text-green-600 bg-green-50 border-green-200';
          case 'RESTRICTED': return 'text-red-600 bg-red-50 border-red-200';
          case 'UPLOAD': return 'text-blue-600 bg-blue-50 border-blue-200';
          case 'AI_FLAGGED': return 'text-orange-600 bg-orange-50 border-orange-200';
          case 'RESET_TO_DRAFT': return 'text-slate-600 bg-slate-100 border-slate-200';
          default: return 'text-gray-600 bg-gray-50 border-gray-200';
      }
  };

  return (
    <div className="flex h-full animate-in fade-in duration-500 overflow-hidden">
        
        {/* LEFT SIDEBAR */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
            <div className="p-5 border-b border-slate-100">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                    <UploadCloud className="w-4 h-4" /> Upload Asset
                </button>
                <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleUpload} accept="image/*,video/*" />
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-6">
                <div>
                    <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Library</h3>
                    <button 
                        onClick={() => { setActiveCollection('all'); setActivePlatformFilter(null); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeCollection === 'all' && !activePlatformFilter ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-100' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        <LayoutGrid className="w-4 h-4" /> All Assets
                    </button>
                </div>

                <div>
                    <div className="flex items-center justify-between px-3 mb-2">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Campaigns</h3>
                        <button className="text-slate-400 hover:text-blue-600"><Plus className="w-3 h-3" /></button>
                    </div>
                    <div className="space-y-0.5">
                        {collections.filter(c => c.type === 'campaign').map(c => (
                            <button 
                                key={c.id}
                                onClick={() => { setActiveCollection(c.id); setActivePlatformFilter(null); }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeCollection === c.id ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-100' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Folder className="w-4 h-4 text-amber-400 fill-amber-100" />
                                    <span className="truncate max-w-[120px]">{c.name}</span>
                                </div>
                                <span className="text-xs text-slate-400">{c.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Platforms</h3>
                    <div className="space-y-0.5">
                        {Object.values(PLATFORM_RULES).map(rule => (
                            <button 
                                key={rule.id}
                                onClick={() => { setActivePlatformFilter(rule.id); setActiveCollection('all'); }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activePlatformFilter === rule.id ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-100' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <PlatformIcon platform={rule.id} size={14} />
                                    <span>{rule.label}</span>
                                </div>
                                <span className="text-xs text-slate-400">{platformCounts[rule.id] || 0}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">
            {/* Toolbar */}
            <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search assets..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-transparent focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-50 rounded-lg text-sm transition-all"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Grid Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                {filteredItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                        <ImageIcon className="w-16 h-16 mb-4" />
                        <p className="text-lg font-medium">No media found</p>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'}`}>
                        {filteredItems.map(item => (
                            <GridItem 
                                key={item.id}
                                item={item}
                                selected={selectedItem?.id === item.id}
                                viewMode={viewMode}
                                onClick={() => handleAssetClick(item)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT DRAWER: Asset Details */}
        {selectedItem && (
            <div className={`w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full absolute right-0 top-0 bottom-0 z-30 transform transition-transform duration-300 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 truncate pr-4">Asset Details</h3>
                    <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 bg-slate-50/50">
                    <button 
                        onClick={() => setActiveTab('details')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Properties
                    </button>
                    <button 
                        onClick={() => setActiveTab('audit')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'audit' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Audit Log
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                    {activeTab === 'details' ? (
                        <>
                            {/* Preview */}
                            <div className="rounded-xl overflow-hidden bg-slate-900 shadow-sm border border-slate-200 aspect-video flex items-center justify-center relative group">
                                {selectedItem.type === 'image' ? (
                                    <img src={selectedItem.url} className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <video 
                                        src={selectedItem.url} 
                                        controls 
                                        className="w-full h-full object-contain" 
                                        controlsList="nodownload" 
                                        playsInline
                                    />
                                )}
                                {/* Processing Status Overlay */}
                                {selectedItem.processingStatus !== 'ready' && selectedItem.processingStatus !== 'failed' && (
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                        <span className="text-xs font-bold uppercase tracking-widest">{selectedItem.processingStatus}...</span>
                                    </div>
                                )}
                            </div>

                            {/* Basic Info */}
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1 break-words">{selectedItem.name}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span>{selectedItem.type.toUpperCase()}</span>
                                    <span>•</span>
                                    <span>{formatBytes(selectedItem.size)}</span>
                                </div>
                            </div>

                            {/* Governance Section */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5" /> Governance & Compliance
                                </h4>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-600">Current Status</span>
                                    {selectedItem.governance.status === 'approved' && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold border border-green-200 uppercase tracking-wide">
                                            <CheckCircle className="w-3 h-3" /> Approved
                                        </span>
                                    )}
                                    {selectedItem.governance.status === 'pending' && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-bold border border-yellow-200 uppercase tracking-wide">
                                            <Clock className="w-3 h-3" /> Pending Review
                                        </span>
                                    )}
                                    {selectedItem.governance.status === 'rejected' && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold border border-red-200 uppercase tracking-wide">
                                            <AlertTriangle className="w-3 h-3" /> Rejected
                                        </span>
                                    )}
                                </div>

                                {/* AI Metadata Badge */}
                                {selectedItem.aiMetadata && selectedItem.aiMetadata.generated && (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-100 text-xs font-medium">
                                        <BrainCircuit className="w-4 h-4" />
                                        <span>Generated by {selectedItem.aiMetadata.tool || 'AI'}</span>
                                    </div>
                                )}

                                {/* Approval Controls */}
                                {selectedItem.governance.status === 'pending' && (
                                    <div className="pt-2 flex flex-col gap-2">
                                        <button 
                                            onClick={handleApprove}
                                            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-3.5 h-3.5" /> Approve Asset
                                        </button>
                                        
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Reason for rejection..." 
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                                            />
                                            <button 
                                                onClick={handleReject}
                                                className="px-3 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {selectedItem.governance.status === 'approved' && selectedItem.governance.approvedBy && (
                                    <div className="text-[10px] text-slate-400 pt-1">
                                        Approved by {selectedItem.governance.approvedBy} on {new Date(selectedItem.governance.approvedAt!).toLocaleDateString()}
                                    </div>
                                )}

                                {selectedItem.governance.status !== 'pending' && (
                                    <button 
                                        onClick={handleReset}
                                        className="w-full mt-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-slate-200"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" /> Re-evaluate (Reset)
                                    </button>
                                )}
                            </div>

                            {/* Platform Readiness Section - NEW */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Smartphone className="w-3.5 h-3.5" /> Platform Readiness
                                </h4>
                                <div className="space-y-2">
                                    {Object.values(PLATFORM_RULES).map(rule => {
                                        const status = selectedItem.platformCompatibility?.[rule.id];
                                        const isReady = status?.compatible;
                                        
                                        return (
                                            <div key={rule.id} className="flex items-start justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <PlatformIcon platform={rule.id} size={14} />
                                                    <span className="font-medium text-slate-700">{rule.label}</span>
                                                </div>
                                                {isReady ? (
                                                    <span className="text-green-600 font-bold flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" /> Ready
                                                    </span>
                                                ) : (
                                                    <div className="text-right">
                                                        <span className="text-amber-600 font-bold flex items-center justify-end gap-1">
                                                            <AlertTriangle className="w-3 h-3" /> Issues
                                                        </span>
                                                        {status?.issues?.map((issue, idx) => (
                                                            <div key={idx} className="text-[10px] text-slate-500 mt-0.5">{issue}</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Metadata Specs */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Dimensions</span>
                                    <span className="text-xs font-bold text-slate-700 font-mono">
                                        {selectedItem.metadata ? `${selectedItem.metadata.width} x ${selectedItem.metadata.height}` : 'Processing...'}
                                    </span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Usage</span>
                                    <span className="text-xs font-bold text-slate-700">
                                        {selectedItem.usageCount || 0} Campaigns
                                    </span>
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
                                    <span>Tags</span>
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedItem.tags?.map(tag => (
                                        <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                                            <Tag className="w-3 h-3 text-slate-400" /> {tag}
                                        </span>
                                    ))}
                                    <button className="text-xs text-blue-600 font-bold hover:underline px-1">+ Add Tag</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Audit Log Tab
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Governance History</h4>
                                <span className="text-[10px] text-slate-400">{auditLogs.length} events</span>
                            </div>
                            
                            <div className="relative border-l-2 border-slate-100 ml-2 space-y-6 pl-4 py-2">
                                {auditLogs.map((log) => (
                                    <div key={log.id} className="relative group">
                                        <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white ring-1 ring-slate-200 ${getActionColor(log.action).split(' ')[1]}`}></div>
                                        <div className="flex justify-between items-start">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getActionColor(log.action)}`}>
                                                {log.action.replace('_', ' ')}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                {new Date(log.timestamp).toLocaleDateString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-sm text-slate-700">
                                            <span className="font-semibold text-slate-900">{log.actor}</span>
                                            {log.reason && (
                                                <div className="mt-1 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 italic">
                                                    "{log.reason}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {auditLogs.length === 0 && (
                                    <div className="text-center py-8 text-slate-400 text-xs italic">
                                        No audit history available.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-slate-100 bg-slate-50 mt-auto grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm">
                        <Download className="w-4 h-4" /> Download
                    </button>
                    <button 
                        onClick={() => handleDelete(selectedItem.id)}
                        disabled={selectedItem.usageCount && selectedItem.usageCount > 0}
                        className="flex items-center justify-center gap-2 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title={selectedItem.usageCount && selectedItem.usageCount > 0 ? "Cannot delete asset in use" : "Delete Asset"}
                    >
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

const GridItem: React.FC<{ 
    item: MediaItem, 
    selected: boolean, 
    viewMode: 'grid' | 'list',
    onClick: () => void
}> = ({ item, selected, viewMode, onClick }) => {
    
    const processing = item.processingStatus === 'processing' || item.processingStatus === 'uploading';
    const failed = item.processingStatus === 'failed';
    const displayUrl = item.thumbnailUrl || item.url;
    const governanceStatus = item.governance.status;

    return (
        <div 
            onClick={onClick}
            className={`
                group relative bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200
                ${selected ? 'ring-2 ring-blue-500 border-transparent shadow-md' : 'hover:border-blue-300'}
                ${viewMode === 'list' ? 'flex items-center h-20 p-2 gap-4' : 'aspect-square'}
            `}
        >
            {/* Visual Content */}
            <div className={`relative bg-gray-50 flex items-center justify-center ${viewMode === 'list' ? 'w-16 h-16 rounded-lg overflow-hidden shrink-0' : 'w-full h-full'}`}>
                {/* Image / Thumbnail */}
                {!failed && (
                    <img 
                        src={displayUrl} 
                        className={`w-full h-full object-cover transition-opacity duration-300 ${processing ? 'opacity-50 blur-sm' : 'opacity-100'}`} 
                        alt={item.name} 
                        loading="lazy"
                    />
                )}

                {/* Governance Status Dot */}
                {!processing && !failed && (
                    <div className="absolute top-2 right-2 z-10">
                        {governanceStatus === 'approved' && <div className="w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white shadow-sm" title="Approved" />}
                        {governanceStatus === 'pending' && <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full ring-2 ring-white shadow-sm" title="Pending Review" />}
                        {governanceStatus === 'rejected' && <div className="w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white shadow-sm" title="Rejected" />}
                    </div>
                )}

                {/* Processing Overlay */}
                {processing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        {viewMode === 'grid' && <span className="text-[10px] font-bold text-blue-700 mt-2 uppercase tracking-wide">Processing</span>}
                    </div>
                )}

                {/* Failed State */}
                {failed && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-red-50">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                        <span className="text-[10px] font-bold text-red-600 mt-2">Error</span>
                    </div>
                )}
                
                {/* Video Indicator (Ready State) */}
                {item.type === 'video' && !processing && !failed && viewMode === 'grid' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                        <div className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                            <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-md flex items-center gap-1">
                            <FileVideo className="w-3 h-3" />
                            <span>{item.metadata?.duration ? `${item.metadata.duration.toFixed(0)}s` : 'Video'}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Metadata (List View) */}
            {viewMode === 'list' && (
                <div className="flex-1 flex items-center justify-between pr-4">
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm truncate max-w-[200px]">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-400">
                                {processing ? 'Processing...' : formatBytes(item.size)}
                            </span>
                            {governanceStatus === 'approved' && <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-bold uppercase">Approved</span>}
                            {governanceStatus === 'pending' && <span className="text-[10px] text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded font-bold uppercase">Pending</span>}
                        </div>
                    </div>
                    {processing && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                </div>
            )}
        </div>
    );
};

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
