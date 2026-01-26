
import React, { useState, useEffect, useRef } from 'react';
import { 
  Image as ImageIcon, UploadCloud, Trash2, Download, X, Search, 
  Folder, Plus, Tag, LayoutGrid, List, Play, FileVideo, Info,
  Loader2, AlertTriangle, CheckCircle, Shield, BrainCircuit, Clock,
  History, RotateCcw, FileText, Smartphone, Wand2, Sparkles, TrendingUp, TrendingDown, Moon, Film
} from 'lucide-react';
import { store } from '../services/mockStore';
import { MediaItem, MediaAuditEvent, EnhancementType } from '../types';
import { getAuditForMedia } from '../services/auditStore';
import { getEnhancementSuggestions } from '../services/enhancementSuggestions';
import { PlatformIcon } from '../components/PlatformIcon';
import { api } from '../services/api';
import { CreativeGenerator } from '../components/CreativeGenerator';
import { usePlatforms } from '../hooks/usePlatforms';

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
  const { platforms } = usePlatforms(); // Hook into Registry
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
  const [isGeneratingVariant, setIsGeneratingVariant] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<EnhancementType[]>([]);
  
  // AI Gen State
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [veoRatio, setVeoRatio] = useState<'16:9' | '9:16'>('16:9');
  
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
                updatedSelected.variants?.length !== selectedItem.variants?.length ||
                updatedSelected.performanceScore !== selectedItem.performanceScore) {
                setSelectedItem(updatedSelected);
                setAuditLogs(getAuditForMedia(updatedSelected.id));
            }
        }
    }
  };

  const calculatePlatformCounts = () => {
    const counts: Record<string, number> = {};
    platforms.forEach(platform => {
        counts[platform.id] = mediaItems.filter(item => 
            item.platformCompatibility?.[platform.id]?.compatible
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

  const handleGenerateVariant = async (platform: string) => {
      if (!selectedItem) return;
      setIsGeneratingVariant(platform);
      try {
          await store['createVariant'](selectedItem.id, platform);
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
          await store['createEnhancedVariant'](selectedItem.id, type);
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
          await store['deleteVariant'](selectedItem.id, variantId);
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

  const handleAiEdit = async () => {
      // ... existing logic ...
  };

  const handleVeoAnimate = async () => {
      // ... existing logic ...
  };

  const getActionColor = (action: string) => {
      switch(action) {
          case 'APPROVED': return 'text-green-600 bg-green-50 border-green-200';
          case 'RESTRICTED': return 'text-red-600 bg-red-50 border-red-200';
          default: return 'text-gray-600 bg-gray-50 border-gray-200';
      }
  };

  const enhancedVariants = selectedItem?.variants?.filter(v => v.enhancementType);

  return (
    <div className="flex h-full animate-in fade-in duration-500 overflow-hidden relative">
        {/* LEFT SIDEBAR */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
            <div className="p-5 border-b border-slate-100 space-y-3">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                    <UploadCloud className="w-4 h-4" /> Upload Asset
                </button>
                <button 
                    onClick={() => setIsGenModalOpen(true)}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                    <Sparkles className="w-4 h-4" /> Create with AI
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
                    <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Platforms</h3>
                    <div className="space-y-0.5">
                        {platforms.map(platform => (
                            <button 
                                key={platform.id}
                                onClick={() => { setActivePlatformFilter(platform.id); setActiveCollection('all'); }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activePlatformFilter === platform.id ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-100' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <PlatformIcon platform={platform.id} size={14} />
                                    <span>{platform.name}</span>
                                </div>
                                <span className="text-xs text-slate-400">{platformCounts[platform.id] || 0}</span>
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
                {/* ... existing header ... */}
                
                {/* Platform Readiness & Variants */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                    {activeTab === 'details' && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Smartphone className="w-3.5 h-3.5" /> Platform Variants
                            </h4>
                            <div className="space-y-4">
                                {platforms.map(platform => {
                                    const status = selectedItem.platformCompatibility?.[platform.id];
                                    const isReady = status?.compatible;
                                    const existingVariant = selectedItem.variants?.find(v => v.platform === platform.id && !v.enhancementType);
                                    const isProcessing = isGeneratingVariant === platform.id;
                                    
                                    return (
                                        <div key={platform.id} className="text-xs border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <PlatformIcon platform={platform.id} size={14} />
                                                    <span className="font-medium text-slate-700">{platform.name}</span>
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
                                                        <span className="text-[10px] text-slate-400">{existingVariant.width}x{existingVariant.height}</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleDeleteVariant(existingVariant.id)}
                                                        className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"
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
                                                        onClick={() => handleGenerateVariant(platform.id)}
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
                    )}
                </div>
            </div>
        )}

        {/* Generate Modal */}
        <CreativeGenerator 
            isOpen={isGenModalOpen} 
            onClose={() => setIsGenModalOpen(false)} 
            onSuccess={(newItem) => {
                setMediaItems([newItem, ...mediaItems]);
                setSelectedItem(newItem);
            }} 
        />
    </div>
  );
};

const GridItem: React.FC<{ 
    item: MediaItem, 
    selected: boolean, 
    viewMode: 'grid' | 'list',
    onClick: () => void
}> = ({ item, selected, viewMode, onClick }) => {
    // ... existing GridItem logic
    return (
        <div onClick={onClick} className={`group relative bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 ${selected ? 'ring-2 ring-blue-500 border-transparent shadow-md' : 'hover:border-blue-300'} ${viewMode === 'list' ? 'flex items-center h-20 p-2 gap-4' : 'aspect-square'}`}>
            <div className={`relative bg-gray-50 flex items-center justify-center ${viewMode === 'list' ? 'w-16 h-16 rounded-lg overflow-hidden shrink-0' : 'w-full h-full'}`}>
                <img src={item.thumbnailUrl || item.url} className="w-full h-full object-cover" />
            </div>
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
