
import React, { useState, useEffect, useRef } from 'react';
import { 
  Image as ImageIcon, Video, UploadCloud, Trash2, Maximize2, Scissors, 
  Check, AlertTriangle, FileVideo, Download, X, Search, Filter, 
  Folder, Plus, MoreHorizontal, ShieldCheck, Zap, Layers, Tag,
  LayoutGrid, List, CheckCircle2, Clock, Globe, Lock, ChevronRight,
  Bot, AlertOctagon, Calendar, Play, Pause, Volume2, VolumeX, Info,
  History, UserCheck
} from 'lucide-react';
import { store } from '../services/mockStore';
import { MediaItem, Platform } from '../types';
import { PlatformIcon } from '../components/PlatformIcon';

// --- Extended Types for UI ---
interface ExtendedMediaItem extends MediaItem {
  status: 'approved' | 'draft' | 'restricted';
  tags: string[];
  collections: string[];
  usageCount: number;
  platformFit: Platform[];
  dimensions: string;
  automationApproved: boolean;
  aiRiskScore?: number; // 0-100, higher is riskier
  expiresAt?: string;
  duration?: string; // 0:15
  approvedBy?: string;
  approvedAt?: string;
}

interface Collection {
  id: string;
  name: string;
  count: number;
  type: 'campaign' | 'pool';
}

// --- Mock Data Generators ---
const COLLECTIONS: Collection[] = [
  { id: 'c1', name: 'Q3 Product Launch', count: 12, type: 'campaign' },
  { id: 'c2', name: 'Evergreen Memes', count: 45, type: 'pool' },
  { id: 'c3', name: 'Holiday Special', count: 8, type: 'campaign' },
  { id: 'c4', name: 'CEO Thought Leadership', count: 15, type: 'pool' },
];

export const MediaLibrary: React.FC = () => {
  // Core Data
  const [mediaItems, setMediaItems] = useState<ExtendedMediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ExtendedMediaItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>(COLLECTIONS);
  
  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<ExtendedMediaItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeCollection, setActiveCollection] = useState<string>('all');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'restricted'>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  useEffect(() => {
    filterMedia();
  }, [mediaItems, searchQuery, filterType, filterStatus, activeCollection]);

  const loadMedia = async () => {
    const rawItems = await store.getMedia();
    
    // Enrich raw items with mock metadata for the demo
    const enriched = rawItems.map((item: any) => {
      const status = item.status || (Math.random() > 0.4 ? 'approved' : 'draft');
      return {
        ...item,
        status: status,
        tags: item.tags || (item.type === 'video' ? ['video', 'social'] : ['product', 'feature', 'q3']),
        collections: item.collections || (Math.random() > 0.7 ? ['c1'] : []),
        usageCount: item.usageCount || Math.floor(Math.random() * 5),
        platformFit: item.platformFit || [Platform.LinkedIn, Platform.Twitter, Platform.Instagram],
        dimensions: item.dimensions || (item.type === 'video' ? '1920x1080' : '1080x1080'),
        automationApproved: status === 'approved', // Sync initial automation status
        aiRiskScore: item.aiRiskScore || Math.floor(Math.random() * 10),
        duration: item.duration || (item.type === 'video' ? '0:15' : undefined),
        approvedBy: status === 'approved' ? 'Admin User' : undefined,
        approvedAt: status === 'approved' ? new Date(Date.now() - Math.random() * 1000000000).toISOString() : undefined
      };
    });
    
    setMediaItems(enriched);
  };

  const filterMedia = () => {
    let result = [...mediaItems];

    if (activeCollection !== 'all') {
      result = result.filter(item => item.collections.includes(activeCollection));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (filterType !== 'all') {
      result = result.filter(item => item.type === filterType);
    }

    if (filterStatus !== 'all') {
      result = result.filter(item => item.status === filterStatus);
    }

    setFilteredItems(result);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsUploading(true);
    setUploadProgress(10);

    // Simulate AI Processing Steps
    const steps = [20, 45, 70, 90];
    for (const p of steps) {
        await new Promise(r => setTimeout(r, 400));
        setUploadProgress(p);
    }

    const files = Array.from(e.target.files);
    for (const file of files) {
        try {
            await store.uploadMedia(file);
        } catch (err) {
            console.error(err);
        }
    }

    setUploadProgress(100);
    await loadMedia();
    setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
    }, 500);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: string) => {
    const item = mediaItems.find(i => i.id === id);
    if (!item) return;

    // Protection Check
    if (item.usageCount > 0) {
        alert(`🚫 Cannot delete "${item.name}"\n\nThis asset is currently used in ${item.usageCount} scheduled posts or bot pools.\nPlease remove usage references before deleting.`);
        return;
    }

    if (confirm('Delete this asset permanently?')) {
        await store.deleteMedia(id);
        setSelectedItem(null);
        setIsDrawerOpen(false);
        await loadMedia();
    }
  };

  const handleStatusChange = (item: ExtendedMediaItem, newStatus: 'approved' | 'restricted' | 'draft') => {
      const updatedItem = {
          ...item,
          status: newStatus,
          automationApproved: newStatus === 'approved',
          approvedBy: newStatus === 'approved' ? 'Current User' : undefined,
          approvedAt: newStatus === 'approved' ? new Date().toISOString() : undefined
      };
      
      const updatedList = mediaItems.map(i => i.id === item.id ? updatedItem : i);
      setMediaItems(updatedList as ExtendedMediaItem[]);
      setSelectedItem(updatedItem as ExtendedMediaItem);
  };

  const handleAssetClick = (item: ExtendedMediaItem) => {
      setSelectedItem(item);
      setIsDrawerOpen(true);
  };

  // --- Render Helpers ---

  return (
    <div className="flex h-full animate-in fade-in duration-500 overflow-hidden">
        
        {/* LEFT SIDEBAR: Collections */}
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
                        onClick={() => setActiveCollection('all')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeCollection === 'all' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-100' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        <LayoutGrid className="w-4 h-4" /> All Assets
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                        <Clock className="w-4 h-4" /> Recent Uploads
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                        <Trash2 className="w-4 h-4" /> Trash
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
                                onClick={() => setActiveCollection(c.id)}
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
                    <div className="flex items-center justify-between px-3 mb-2">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bot Pools</h3>
                        <button className="text-slate-400 hover:text-blue-600"><Plus className="w-3 h-3" /></button>
                    </div>
                    <div className="space-y-0.5">
                        {collections.filter(c => c.type === 'pool').map(c => (
                            <button 
                                key={c.id}
                                onClick={() => setActiveCollection(c.id)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeCollection === c.id ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-100' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-indigo-400" />
                                    <span className="truncate max-w-[120px]">{c.name}</span>
                                </div>
                                <span className="text-xs text-slate-400">{c.count}</span>
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
                    <div className="h-6 w-px bg-slate-200"></div>
                    <div className="flex items-center gap-2">
                        <select 
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Types</option>
                            <option value="image">Images</option>
                            <option value="video">Videos</option>
                        </select>
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="approved">Approved</option>
                            <option value="restricted">Restricted</option>
                            <option value="draft">Draft</option>
                        </select>
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

            {/* Upload Progress Bar */}
            {isUploading && (
                <div className="absolute top-16 left-0 right-0 z-20 bg-blue-50 border-b border-blue-100 p-3 flex items-center justify-between animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                        <div>
                            <p className="text-sm font-bold text-blue-900">Uploading & Analyzing...</p>
                            <p className="text-xs text-blue-700">AI is tagging your content and checking for compliance.</p>
                        </div>
                    </div>
                    <div className="w-48 bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                </div>
            )}

            {/* Grid Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'}`}>
                    {filteredItems.map(item => (
                        <GridItem 
                            key={item.id}
                            item={item}
                            selected={selectedItem?.id === item.id}
                            viewMode={viewMode}
                            onClick={() => handleAssetClick(item)}
                            onDelete={() => handleDelete(item.id)}
                        />
                    ))}
                </div>
            </div>
        </div>

        {/* RIGHT DRAWER: Asset Details */}
        {selectedItem && (
            <div className={`w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full absolute right-0 top-0 bottom-0 z-30 transform transition-transform duration-300 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 truncate pr-4">Asset Governance</h3>
                    <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                    
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
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Size</span>
                            <span className="text-xs font-bold text-slate-700">{formatBytes(selectedItem.size)}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Dimensions</span>
                            <span className="text-xs font-bold text-slate-700">{selectedItem.dimensions}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">{selectedItem.type === 'video' ? 'Duration' : 'Format'}</span>
                            <span className="text-xs font-bold text-slate-700">
                                {selectedItem.type === 'video' ? (selectedItem.duration || '0:15') : 'PNG'}
                            </span>
                        </div>
                    </div>

                    {/* Approval & Governance Controls */}
                    <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-slate-500" />
                                Governance
                            </h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                selectedItem.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                selectedItem.status === 'restricted' ? 'bg-red-100 text-red-700 border-red-200' :
                                'bg-amber-100 text-amber-700 border-amber-200'
                            }`}>
                                {selectedItem.status === 'approved' ? <CheckCircle2 className="w-3 h-3" /> : 
                                 selectedItem.status === 'restricted' ? <Lock className="w-3 h-3" /> : 
                                 <Clock className="w-3 h-3" />}
                                {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                            </span>
                        </div>

                        {/* Approval Info */}
                        {selectedItem.status === 'approved' && (
                            <div className="text-[10px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                                <UserCheck className="w-3.5 h-3.5 mt-0.5 text-slate-400" />
                                <div>
                                    Approved by <span className="font-bold text-slate-700">{selectedItem.approvedBy || 'Admin'}</span>
                                    <br />
                                    <span className="text-slate-400">{selectedItem.approvedAt ? new Date(selectedItem.approvedAt).toLocaleDateString() : 'Recently'}</span>
                                </div>
                            </div>
                        )}

                        {/* Controls */}
                        <div className="flex gap-2">
                            {selectedItem.status !== 'approved' && (
                                <button 
                                    onClick={() => handleStatusChange(selectedItem, 'approved')}
                                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                </button>
                            )}
                            {selectedItem.status !== 'restricted' && (
                                <button 
                                    onClick={() => handleStatusChange(selectedItem, 'restricted')}
                                    className="flex-1 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <Lock className="w-3.5 h-3.5" /> Restrict
                                </button>
                            )}
                            {selectedItem.status !== 'draft' && (
                                 <button 
                                    onClick={() => handleStatusChange(selectedItem, 'draft')}
                                    className="px-3 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors"
                                    title="Reset to Draft"
                                >
                                    Draft
                                </button>
                            )}
                        </div>

                        {/* Bot Usage Indicator */}
                        <div className={`flex items-center gap-2 text-xs p-2 rounded border ${selectedItem.automationApproved ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-100 text-slate-500 border-slate-200 opacity-60'}`}>
                            <Bot className="w-4 h-4" />
                            <span className="font-medium">
                                {selectedItem.automationApproved ? 'Available for Automation' : 'Automation Disabled'}
                            </span>
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
                            <span>Smart Tags</span>
                            <span className="text-[10px] bg-slate-100 px-1.5 rounded text-slate-500">AI Suggested</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedItem.tags.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 cursor-pointer border border-slate-200">
                                    <Tag className="w-3 h-3 text-slate-400" /> {tag}
                                </span>
                            ))}
                            <button className="text-xs text-blue-600 font-bold hover:underline px-1">+ Add</button>
                        </div>
                    </div>

                    {/* Collections */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-900 mb-2">Campaigns & Pools</h4>
                        <div className="space-y-2">
                            {selectedItem.collections.map(cid => {
                                const col = collections.find(c => c.id === cid);
                                return col ? (
                                    <div key={cid} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                        <Folder className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-xs font-medium text-slate-700">{col.name}</span>
                                        <span className="text-[10px] bg-white border px-1.5 rounded text-slate-400 ml-auto uppercase">{col.type}</span>
                                    </div>
                                ) : null;
                            })}
                            <button className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors">
                                Add to Collection
                            </button>
                        </div>
                    </div>

                    {/* Usage Intel */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-900 mb-2">Usage Intelligence</h4>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Total Usage</span>
                                <span className="font-bold text-slate-900">{selectedItem.usageCount} Posts</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Avg Engagement</span>
                                <span className="font-bold text-green-600">+4.2%</span>
                            </div>
                            <div className="h-px bg-slate-200 my-2"></div>
                            <div className="flex gap-2">
                                {selectedItem.platformFit.map(p => (
                                    <div key={p} className="bg-white p-1 rounded shadow-sm border border-slate-100" title={`Good for ${p}`}>
                                        <PlatformIcon platform={p} size={12} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
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
        )}
    </div>
  );
};

// --- Sub Components ---

const GridItem: React.FC<{ 
    item: ExtendedMediaItem, 
    selected: boolean, 
    viewMode: 'grid' | 'list',
    onClick: () => void,
    onDelete: () => void
}> = ({ item, selected, viewMode, onClick, onDelete }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleMouseEnter = () => {
        if (item.type === 'video' && videoRef.current) {
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
        }
    };

    const handleMouseLeave = () => {
        if (item.type === 'video' && videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    };

    return (
        <div 
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`
                group relative bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200
                ${selected ? 'ring-2 ring-blue-500 border-transparent shadow-md' : 'hover:border-blue-300'}
                ${viewMode === 'list' ? 'flex items-center h-20 p-2 gap-4' : 'aspect-square'}
            `}
        >
            {/* Visual Content */}
            <div className={`relative bg-gray-50 flex items-center justify-center ${viewMode === 'list' ? 'w-16 h-16 rounded-lg overflow-hidden shrink-0' : 'w-full h-full'}`}>
                {item.type === 'image' ? (
                    <img src={item.url} className="w-full h-full object-cover" alt={item.name} />
                ) : (
                    <>
                        <video 
                            ref={videoRef}
                            src={item.url} 
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                            preload="metadata"
                        />
                        {!isPlaying && viewMode === 'grid' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                <div className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                                </div>
                            </div>
                        )}
                        {/* Video Badge */}
                        {viewMode === 'grid' && (
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-md flex items-center gap-1">
                                <FileVideo className="w-3 h-3" />
                                <span>{item.duration || '0:15'}</span>
                            </div>
                        )}
                    </>
                )}
                
                {/* Overlay Gradient (Grid Only) */}
                {viewMode === 'grid' && (
                    <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex justify-end">
                        <button 
                            onClick={(e) => { e.stopPropagation(); }} 
                            className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg text-white backdrop-blur-md transition-colors"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Metadata (List View) */}
            {viewMode === 'list' && (
                <div className="flex-1 flex items-center justify-between pr-4">
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm truncate max-w-[200px]">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                item.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                item.status === 'restricted' ? 'bg-red-100 text-red-700 border-red-200' :
                                'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                                {item.status === 'approved' ? 'Approved' : item.status === 'restricted' ? 'Restricted' : 'Draft'}
                            </span>
                            <span className="text-xs text-slate-400">• {item.dimensions}</span>
                            {item.type === 'video' && <span className="text-xs text-slate-400">• {item.duration}</span>}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-1">
                            {item.platformFit.map(p => (
                                <div key={p} className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                    <PlatformIcon platform={p} size={12} />
                                </div>
                            ))}
                        </div>
                        <button onClick={(e) => {e.stopPropagation(); onDelete()}} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Status Badges (Grid View) */}
            {viewMode === 'grid' && (
                <div className="absolute top-2 left-2 flex gap-1">
                    {item.status === 'approved' && <div className="bg-green-500 w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm" title="Approved"></div>}
                    {item.status === 'restricted' && <div className="bg-red-500 w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm" title="Restricted"></div>}
                    {item.status === 'draft' && <div className="bg-amber-400 w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm" title="Draft"></div>}
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
