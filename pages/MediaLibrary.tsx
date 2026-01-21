import React, { useState, useEffect, useRef } from 'react';
import { Image, Video, UploadCloud, Trash2, Maximize2, Scissors, Check, AlertTriangle, FileVideo, Download } from 'lucide-react';
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
      // Reset input to allow selecting the same file again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    if (window.confirm("Are you sure you want to delete this file?")) {
      await store.deleteMedia(id);
      await loadMedia();
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processUpload(e.dataTransfer.files[0]);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleOptimize = async (variant: string) => {
    if (!selectedItem) return;
    setIsUploading(true);
    // Simulate processing delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      await store.createOptimizedCopy(selectedItem.id, variant);
      await loadMedia();
      setSelectedItem(null); // Close modal on success
    } catch (err) {
      console.error("Optimization failed", err);
      setError("Failed to create optimized variant");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Image className="w-6 h-6 text-blue-600" />
          Media Library
        </h1>
        <p className="text-slate-500">Upload, manage, and optimize your creative assets.</p>
      </header>

      {/* Upload Area */}
      <div 
        className={`bg-white border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${isUploading ? 'bg-slate-50 border-blue-300' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/png, image/jpeg, image/webp, video/mp4" 
          onChange={handleFileSelect}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
            <p className="text-slate-600 font-medium">Processing File...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center pointer-events-none">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Click to upload or drag and drop</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Supports JPG, PNG, WEBP (Images) and MP4 (Video).
              <br />
              <span className="text-xs text-slate-400">Max size: 50MB for videos.</span>
            </p>
            {error && (
              <div className="mt-4 p-2 bg-red-50 text-red-600 text-sm rounded flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media Grid */}
      <div className="flex-1 overflow-y-auto">
        {mediaItems.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Image className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Your library is empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {mediaItems.map((item) => (
              <div 
                key={item.id} 
                className="group relative bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <div className="aspect-square bg-slate-100 relative flex items-center justify-center overflow-hidden">
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center">
                      <FileVideo className="w-12 h-12 mb-2" />
                      <span className="text-xs font-mono">MP4</span>
                    </div>
                  )}
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                     <button 
                        onClick={(e) => handleDelete(e, item.id)}
                        className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50" title="Delete"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                     <button className="p-2 bg-white text-blue-600 rounded-full hover:bg-blue-50" title="View">
                        <Maximize2 className="w-4 h-4" />
                     </button>
                  </div>
                </div>
                
                <div className="p-3">
                  <p className="text-sm font-medium text-slate-900 truncate" title={item.name}>{item.name}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-slate-500">{formatBytes(item.size)}</span>
                    <span className="text-[10px] uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                      {item.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview/Optimize Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-[80vh]" onClick={e => e.stopPropagation()}>
            
            {/* Preview Section */}
            <div className="flex-1 bg-slate-900 flex items-center justify-center p-6 relative">
               {selectedItem.type === 'image' ? (
                 <img src={selectedItem.url} alt="Preview" className="max-w-full max-h-full object-contain" />
               ) : (
                 <video src={selectedItem.url} controls className="max-w-full max-h-full" />
               )}
            </div>

            {/* Sidebar Controls */}
            <div className="w-full md:w-80 bg-white border-l border-slate-200 flex flex-col">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-lg text-slate-900 mb-1">Asset Details</h3>
                <p className="text-sm text-slate-500 break-all">{selectedItem.name}</p>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <div>
                   <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">File Info</h4>
                   <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">Size:</span> <span className="text-slate-900 font-medium">{formatBytes(selectedItem.size)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Type:</span> <span className="text-slate-900 font-medium uppercase">{selectedItem.type}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Date:</span> <span className="text-slate-900 font-medium">{new Date(selectedItem.createdAt).toLocaleDateString()}</span></div>
                   </div>
                </div>

                {selectedItem.type === 'image' && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                       <Scissors className="w-3 h-3" /> Smart Optimization
                    </h4>
                    <p className="text-xs text-slate-500 mb-3">Generate optimized variants for social platforms.</p>
                    
                    <div className="space-y-2">
                      <button 
                        onClick={() => handleOptimize('Square')}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                      >
                         <div className="flex items-center gap-2">
                           <div className="w-4 h-4 border border-slate-400 rounded-sm"></div>
                           <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">Square (1:1)</span>
                         </div>
                         <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                      </button>
                      <button 
                        onClick={() => handleOptimize('Story')}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                      >
                         <div className="flex items-center gap-2">
                           <div className="w-3 h-5 border border-slate-400 rounded-sm"></div>
                           <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">Story (9:16)</span>
                         </div>
                         <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                      </button>
                      <button 
                        onClick={() => handleOptimize('Landscape')}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                      >
                         <div className="flex items-center gap-2">
                           <div className="w-5 h-3 border border-slate-400 rounded-sm"></div>
                           <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">Landscape (16:9)</span>
                         </div>
                         <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
