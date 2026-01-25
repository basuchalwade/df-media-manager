
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
                {/* Campaigns List Placeholder */}
            </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">
            <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
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
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                {filteredItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                        <ImageIcon className="w-16 h-16 mb-4" />
                        <p className="text-lg font-medium">No media found</p>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'}`}>
                        {filteredItems.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => handleAssetClick(item)}
                                className={`
                                    group relative bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200
                                    ${selectedItem?.id === item.id ? 'ring-2 ring-blue-500 border-transparent shadow-md' : 'hover:border-blue-300'}
                                    ${viewMode === 'list' ? 'flex items-center h-20 p-2 gap-4' : 'aspect-square'}
                                `}
                            >
                                <div className={`relative bg-gray-50 flex items-center justify-center ${viewMode === 'list' ? 'w-16 h-16 rounded-lg overflow-hidden shrink-0' : 'w-full h-full'}`}>
                                    {item.processingStatus !== 'failed' && (
                                        <img 
                                            src={item.thumbnailUrl || item.url} 
                                            className={`w-full h-full object-cover transition-opacity duration-300 ${item.processingStatus === 'processing' ? 'opacity-50 blur-sm' : 'opacity-100'}`} 
                                            alt={item.name} 
                                            loading="lazy"
                                        />
                                    )}
                                    {item.type === 'video' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                                            <div className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                                                <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {viewMode === 'list' && (
                                    <div className="flex-1 flex items-center justify-between pr-4">
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm truncate max-w-[200px]">{item.name}</h4>
                                            <span className="text-xs text-slate-400">{formatBytes(item.size)}</span>
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
                <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 truncate pr-4">Asset Details</h3>
                    <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                    <div className="rounded-xl overflow-hidden bg-slate-900 shadow-sm border border-slate-200 aspect-video flex items-center justify-center relative group">
                        {selectedItem.type === 'image' ? (
                            <img src={selectedItem.url} className="max-w-full max-h-full object-contain" />
                        ) : (
                            <video src={selectedItem.url} controls className="w-full h-full object-contain" playsInline />
                        )}
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-1 break-words">{selectedItem.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{selectedItem.type.toUpperCase()}</span>
                            <span>•</span>
                            <span>{formatBytes(selectedItem.size)}</span>
                        </div>
                    </div>
                    {/* Platform Readiness & Variants */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Wand2 className="w-3.5 h-3.5" /> Platform Variants
                        </h4>
                        <div className="space-y-4">
                            {Object.values(PLATFORM_RULES).map((rule: any) => {
                                const status = selectedItem.platformCompatibility?.[rule.id];
                                const isReady = status?.compatible;
                                const existingVariant = selectedItem.variants?.find(v => v.platform === rule.id && !v.enhancementType);
                                const isProcessing = isGeneratingVariant === rule.id;
                                
                                return (
                                    <div key={rule.id} className="text-xs border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <PlatformIcon platform={rule.id} size={14} />
                                                <span className="font-medium text-slate-700">{rule.label}</span>
                                            </div>
                                            {isReady ? (
                                                <span className="text-green-600 font-bold flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Compatible
                                                </span>
                                            ) : (
                                                <span className="text-amber-600 font-bold flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" /> Optimization Needed
                                                </span>
                                            )}
                                        </div>

                                        {/* Variant UI */}
                                        {existingVariant ? (
                                            <div className="flex gap-3 bg-white p-2 rounded-lg border border-slate-200">
                                                <div className="w-12 h-12 bg-slate-100 rounded overflow-hidden shrink-0">
                                                    <img src={existingVariant.thumbnailUrl} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 flex flex-col justify-center">
                                                    <span className="font-bold text-slate-700">Variant Active</span>
                                                    <span className="text-[10px] text-slate-400">{existingVariant.width}x{existingVariant.height} • {new Date(existingVariant.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteVariant(existingVariant.id)}
                                                    className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                                                    title="Delete Variant"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : !isReady ? (
                                            <div className="pl-6">
                                                <div className="text-[10px] text-slate-500 mb-2">
                                                    {status?.issues?.join(', ')}
                                                </div>
                                                <button 
                                                    onClick={() => handleGenerateVariant(rule.id)}
                                                    disabled={isProcessing}
                                                    className="w-full py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-[11px] font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                                                >
                                                    {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                                    {isProcessing ? 'Generating...' : 'Generate Optimized Variant'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="pl-6 text-[10px] text-slate-400 italic">
                                                Original asset is ready for use.
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="p-5 border-t border-slate-100 bg-slate-50 mt-auto grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm">
                            <Download className="w-4 h-4" /> Download
                        </button>
                        <button 
                            onClick={() => handleDelete(selectedItem.id)}
                            className="flex items-center justify-center gap-2 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 shadow-sm"
                        >
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
