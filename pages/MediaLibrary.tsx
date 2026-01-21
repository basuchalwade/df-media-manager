import React, { useState, useEffect, useRef } from 'react';
import { Image, Video, UploadCloud, Trash2, Maximize2, Scissors, Check, AlertTriangle, FileVideo, Download, X } from 'lucide-react';
import { store } from '../services/mockStore';
import { MediaItem } from '../types';

export const MediaLibrary: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    const items = await store.getMedia();
    setMediaItems(items);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processUpload(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const processUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      await store.uploadMedia(file);
      await loadMedia();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure?")) {
      await store.deleteMedia(id);
      await loadMedia();
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const handleOptimize = async (variant: string) => {
    if (!selectedItem) return;
    setIsUploading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      await store.createOptimizedCopy(selectedItem.id, variant);
      await loadMedia();
      setSelectedItem(null);
    } catch (err) {
      setError("Failed to create optimized variant");
    } finally {
      setIsUploading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Assets</h1>
          <p className="text-slate-500 font-medium mt-1">Centralized media repository.</p>
        </div>
        <button 
           onClick={() => fileInputRef.current?.click()}
           className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
        >
           <UploadCloud className="w-4 h-4" /> Upload
        </button>
      </header>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/mp4" onChange={handleFileSelect} />

      {/* Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
           {/* Upload Placeholder */}
           <div 
             onClick={() => fileInputRef.current?.click()}
             className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center cursor-pointer group text-slate-400 hover:text-blue-500"
           >
             <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors">
               {isUploading ? <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/> : <UploadCloud className="w-6 h-6" />}
             </div>
             <span className="text-sm font-semibold">New Asset</span>
           </div>

           {mediaItems.map((item) => (
             <div 
               key={item.id} 
               onClick={() => setSelectedItem(item)}
               className="group relative aspect-square bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300"
             >
                {item.type === 'image' ? (
                  <img src={item.url} className="w-full h-full object-cover" alt={item.name} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                    <FileVideo className="w-10 h-10 mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Video</span>
                  </div>
                )}
                
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                   <p className="text-white text-sm font-medium truncate">{item.name}</p>
                   <p className="text-white/60 text-xs">{formatBytes(item.size)}</p>
                </div>

                <button 
                  onClick={(e) => handleDelete(e, item.id)}
                  className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                >
                   <Trash2 className="w-4 h-4" />
                </button>
             </div>
           ))}
        </div>
      </div>

      {/* Asset Viewer Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md animate-in fade-in">
           <div className="bg-white rounded-[32px] w-full max-w-5xl h-[80vh] flex overflow-hidden shadow-2xl relative">
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 bg-black/10 hover:bg-black/20 text-slate-800 p-2 rounded-full backdrop-blur-sm transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex-1 bg-slate-100 flex items-center justify-center p-8">
                 {selectedItem.type === 'image' ? (
                   <img src={selectedItem.url} className="max-w-full max-h-full object-contain shadow-lg rounded-lg" alt="Preview" />
                 ) : (
                   <video src={selectedItem.url} controls className="max-w-full max-h-full rounded-lg shadow-lg" />
                 )}
              </div>

              <div className="w-96 bg-white border-l border-slate-100 flex flex-col p-8">
                 <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-2">{selectedItem.name}</h3>
                 <p className="text-sm text-slate-400 font-medium mb-6">Added on {new Date(selectedItem.createdAt).toLocaleDateString()}</p>
                 
                 <div className="space-y-4 mb-8">
                    <div className="flex justify-between py-3 border-b border-slate-50">
                      <span className="text-sm text-slate-500">Size</span>
                      <span className="text-sm font-semibold text-slate-900">{formatBytes(selectedItem.size)}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-slate-50">
                      <span className="text-sm text-slate-500">Dimensions</span>
                      <span className="text-sm font-semibold text-slate-900">{selectedItem.dimensions || 'Unknown'}</span>
                    </div>
                 </div>

                 {selectedItem.type === 'image' && (
                    <div className="space-y-3">
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Smart Actions</h4>
                       <button onClick={() => handleOptimize('Square')} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group">
                          <span className="text-sm font-bold text-slate-700">Square (1:1)</span>
                          <Scissors className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                       </button>
                       <button onClick={() => handleOptimize('Story')} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group">
                          <span className="text-sm font-bold text-slate-700">Story (9:16)</span>
                          <Scissors className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                       </button>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};