
import React, { useState, useEffect, useRef } from 'react';
import { 
  Image as ImageIcon, UploadCloud, Trash2, Download, X, Search, 
  Folder, Plus, Tag, LayoutGrid, List, Play, FileVideo,
  Loader2, AlertTriangle, CheckCircle, Shield, BrainCircuit, Clock,
  RotateCcw, Wand2, Sparkles, TrendingUp, TrendingDown, Moon
} from 'lucide-react';
import { store } from '../services/mockStore';
import { MediaItem, EnhancementType } from '../types';
import { getAuditForMedia } from '../services/auditStore';
import { PLATFORM_RULES } from '../services/platformRules';
import { getEnhancementSuggestions } from '../services/enhancementSuggestions';
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
  const [auditLogs, setAuditLogs] = useState<any[]>([]); // Using any for simplicity with mock
  const [activeTab, setActiveTab] = useState<'details' | 'audit'>('details');
  const [platformCounts, setPlatformCounts] = useState<Record<string, number>>({});
  const [isGeneratingVariant, setIsGeneratingVariant] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<EnhancementType[]>([]);
  
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
      setAuditLogs(getAuditForMedia(selectedItem.id));
      setSuggestions(getEnhancementSuggestions(selectedItem));
    }
  }, [selectedItem, isDrawerOpen]);

  const loadMedia = async () => {
    const rawItems = await store.getMedia();
    setMediaItems(rawItems);
    
    if (selectedItem) {
        const updatedSelected = rawItems.find(i => i.id === selectedItem.id);
        if (updatedSelected) {
            if (updatedSelected.processingStatus !== selectedItem.processingStatus || 
                updatedSelected.governance.status !== selectedItem.governance.status ||
                updatedSelected.variants?.length !== selectedItem.variants?.length) {
                setSelectedItem(updatedSelected);
                setAuditLogs(getAuditForMedia(updatedSelected.id));
            }
        }
    }
  };

  const calculatePlatformCounts = () => {
    const counts: Record<string, number> = {};
    Object.values(PLATFORM_RULES).forEach((rule: any) => {
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
      await store.resetMedia(selectedItem.id);
      await loadMedia();
  };

  const handleGenerateVariant = async (platform: string) => {
      if (!selectedItem) return;
      setIsGeneratingVariant(platform);
      try {
          await store.createVariant(selectedItem.id, platform);
          await loadMedia();
      } catch (e) {
          console.error(e);
          alert('Failed to generate variant.');
      } finally {
          setIsGeneratingVariant(null);
      }
  };

  const handleEnhance = async (type: EnhancementType) => {
      if (!selectedItem) return;
      setIsEnhancing(type);
      try {
          await store.createEnhancedVariant(selectedItem.id, type);
          await loadMedia();
      } catch (e) {
          console.error(e);
          alert('Enhancement failed.');
      } finally {
          setIsEnhancing(null);
      }
  };

  const handleDeleteVariant = async (variantId: string) => {
      if (!selectedItem) return;
      if (confirm('Delete this variant?')) {
          await store.deleteVariant(selectedItem.id, variantId);
          await loadMedia();
      }
  };

  const handleAssetClick = (item: MediaItem) => {
      setSelectedItem(item);
      setIsDrawerOpen(true);
      setRejectionReason('');
      setActiveTab('details');
      setAuditLogs(getAuditForMedia(item.id));
      setSuggestions(getEnhancementSuggestions(item));
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getActionColor = (action: string) => {
      switch(action) {
          case 'APPROVED': return 'text-green-600 bg-green-50 border-green-200';
          case 'RESTRICTED': return 'text-red-600 bg-red-50 border-red-200';
          case 'UPLOAD': return 'text-blue-600 bg-blue-50 border-blue-200';
          case 'AI_FLAGGED': return 'text-orange-600 bg-orange-50 border-orange-200';
          default: return 'text-gray-600 bg-gray-50 border-gray-200';
      }
  };

  return (
    <div className="flex h-full animate-in fade-in duration-500 overflow-hidden">
        {/* LEFT SIDEBAR FILTERS */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 custom-scrollbar overflow-y-auto">
            <div className="p-5 border-b border-slate-100">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                    <UploadCloud className="w-4 h-4" /> Upload Asset
                </button>
                <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleUpload} accept="image/*,video/*" />
            </div>

            <div className="p-3 space-y-6">
                <div>
                    <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Library</h3>
                    <div className="space-y-0.5">
                        <button 
                            onClick={() => { setActiveCollection('all'); setActivePlatformFilter(null); }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeCollection === 'all' && !activePlatformFilter ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-100' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            <LayoutGrid className="w-4 h-4" /> All Assets
                        </button>
                    </div>
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
                                <span className="text-xs text-slate-400 font-medium bg-slate-100 px-1.5 rounded">{c.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Platforms</h3>
                    <div className="space-y-0.5">
                        {Object.values(PLATFORM_RULES).map((rule: any) => (
                            <button 
                                key={rule.id}
                                onClick={() => { setActivePlatformFilter(rule.id); setActiveCollection('all'); }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activePlatformFilter === rule.id ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-100' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <PlatformIcon platform={rule.id} size={14} />
                                    <span>{rule.label}</span>
                                </div>
                                <span className="text-xs text-slate-400 font-medium bg-slate-100 px-1.5 rounded">{platformCounts[rule.id] || 0}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">
            <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 shrink-0 sticky top-0 z-20 bg-white/80 backdrop-blur-md">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search assets..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-transparent focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-50/50 rounded-xl text-sm transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 custom-scrollbar">
                {filteredItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <ImageIcon className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-lg font-bold text-slate-500">No media found</p>
                        <p className="text-sm">Try adjusting your filters or upload new assets.</p>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'}`}>
                        {filteredItems.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => handleAssetClick(item)}
                                className={`
                                    group relative bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300
                                    ${selectedItem?.id === item.id ? 'ring-2 ring-blue-500 border-transparent shadow-md transform scale-[1.02]' : 'hover:border-blue-200 hover:-translate-y-1'}
                                    ${viewMode === 'list' ? 'flex items-center h-20 p-2 gap-4' : 'aspect-[1/1]'}
                                `}
                            >
                                <div className={`relative bg-gray-100 flex items-center justify-center overflow-hidden ${viewMode === 'list' ? 'w-16 h-16 rounded-xl shrink-0' : 'w-full h-full'}`}>
                                    {item.processingStatus !== 'failed' && (
                                        <img 
                                            src={item.thumbnailUrl || item.url} 
                                            className={`w-full h-full object-cover transition-opacity duration-300 ${item.processingStatus === 'processing' ? 'opacity-50 blur-sm' : 'opacity-100'}`} 
                                            alt={item.name} 
                                            loading="lazy"
                                        />
                                    )}
                                    
                                    {/* Video Indicator */}
                                    {item.type === 'video' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                                            <div className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white/20">
                                                <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Status Dot */}
                                    <div className="absolute top-2 right-2 z-10">
                                        {item.governance.status === 'approved' && <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>}
                                        {item.governance.status === 'pending' && <div className="w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-sm"></div>}
                                    </div>
                                    
                                    {/* Overlay Gradient on Hover */}
                                    {viewMode === 'grid' && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                            <p className="text-white font-bold text-sm truncate drop-shadow-md">{item.name}</p>
                                            <p className="text-white/80 text-xs">{formatBytes(item.size)}</p>
                                        </div>
                                    )}
                                </div>
                                
                                {viewMode === 'list' && (
                                    <div className="flex-1 flex items-center justify-between pr-4">
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm truncate max-w-[300px]">{item.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-slate-400 font-medium bg-slate-100 px-1.5 rounded">{formatBytes(item.size)}</span>
                                                {item.tags?.map(tag => (
                                                    <span key={tag} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-wide">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${item.governance.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                                {item.governance.status}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT DRAWER: Asset Details */}
        {selectedItem && (
            <div className={`w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full absolute right-0 top-0 bottom-0 z-30 transform transition-transform duration-300 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 bg-white sticky top-0 z-10">
                    <h3 className="font-bold text-slate-900 truncate pr-4 text-lg">Asset Details</h3>
                    <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-white">
                    {/* Preview Hero */}
                    <div className="rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm aspect-video flex items-center justify-center relative group">
                        {selectedItem.type === 'image' ? (
                            <img src={selectedItem.url} className="max-w-full max-h-full object-contain" />
                        ) : (
                            <video src={selectedItem.url} controls className="w-full h-full object-contain" playsInline />
                        )}
                    </div>

                    {/* Metadata Header */}
                    <div>
                        <h4 className="font-bold text-slate-900 text-lg mb-1 break-words leading-tight">{selectedItem.name}</h4>
                        <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mt-2">
                            <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 uppercase">{selectedItem.type}</span>
                            <span>•</span>
                            <span>{formatBytes(selectedItem.size)}</span>
                            <span>•</span>
                            <span>{new Date(selectedItem.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* AI & Governance */}
                    <div className="space-y-4">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5" /> Governance
                        </h5>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-medium text-slate-600">Status</span>
                                {selectedItem.governance.status === 'approved' && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200 uppercase tracking-wide">
                                        <CheckCircle className="w-3.5 h-3.5" /> Approved
                                    </span>
                                )}
                                {selectedItem.governance.status === 'pending' && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 uppercase tracking-wide">
                                        <Clock className="w-3.5 h-3.5" /> Pending Review
                                    </span>
                                )}
                            </div>
                            
                            {selectedItem.governance.status === 'pending' && (
                                <div className="flex gap-2">
                                    <button onClick={handleApprove} className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">
                                        Approve
                                    </button>
                                    <button onClick={handleReject} className="flex-1 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors">
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Platform Variants */}
                    <div className="space-y-4">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Wand2 className="w-3.5 h-3.5" /> Platform Variants
                        </h5>
                        <div className="grid gap-3">
                            {Object.values(PLATFORM_RULES).map((rule: any) => {
                                const status = selectedItem.platformCompatibility?.[rule.id];
                                const isReady = status?.compatible;
                                const existingVariant = selectedItem.variants?.find(v => v.platform === rule.id && !v.enhancementType);
                                
                                return (
                                    <div key={rule.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                                                <PlatformIcon platform={rule.id} size={16} />
                                            </div>
                                            <div>
                                                <span className="block text-xs font-bold text-slate-700">{rule.label}</span>
                                                <span className={`text-[10px] font-medium ${isReady ? 'text-green-600' : 'text-amber-600'}`}>
                                                    {isReady ? 'Optimized' : 'Needs Resize'}
                                                </span>
                                            </div>
                                        </div>
                                        {!existingVariant && !isReady && (
                                            <button 
                                                onClick={() => handleGenerateVariant(rule.id)}
                                                className="text-[10px] font-bold bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                                            >
                                                Auto-Fix
                                            </button>
                                        )}
                                        {existingVariant && (
                                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200">
                                                <img src={existingVariant.thumbnailUrl} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 mt-auto grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-sm transition-colors">
                        <Download className="w-4 h-4" /> Download
                    </button>
                    <button 
                        onClick={() => handleDelete(selectedItem.id)}
                        className="flex items-center justify-center gap-2 py-3 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 shadow-sm transition-colors"
                    >
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};
