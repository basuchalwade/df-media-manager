
import React, { useEffect, useState, useRef } from 'react';
import { X, Image as ImageIcon, FileVideo, UploadCloud, Plus, Loader2, Play } from 'lucide-react';
import { store } from '../services/mockStore';
import { MediaItem } from '../types';

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
}

export const MediaPicker: React.FC<MediaPickerProps> = ({ isOpen, onClose, onSelect }) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen]);

  const loadMedia = () => {
    store.getMedia().then(setMediaItems);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    for (const file of Array.from(files) as File[]) {
      try {
        await store.uploadMedia(file);
      } catch (err: any) {
        console.error("Upload failed for file " + file.name, err);
      }
    }
    
    await loadMedia();
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h3 className="font-bold text-xl text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
               <ImageIcon className="w-5 h-5 text-blue-600" />
            </div>
            Select Media Asset
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UploadCloud className="w-4 h-4" />
              )}
              {isUploading ? 'Uploading...' : 'Upload New'}
            </button>
            <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/png, image/jpeg, image/webp, video/mp4" 
          multiple
          onChange={handleFileUpload}
        />

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/50">
          {mediaItems.length === 0 ? (
            <div className="text-center py-20 text-slate-400 flex flex-col items-center justify-center h-full">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <ImageIcon className="w-10 h-10 text-slate-300" />
              </div>
              <p className="mb-2 text-lg font-bold text-slate-600">No media found</p>
              <p className="mb-6 text-sm">Upload assets to use them in your campaigns.</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 font-bold hover:underline flex items-center gap-2 px-5 py-2.5 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4" /> Upload from device
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {mediaItems.map((item) => {
                const displayUrl = item.thumbnailUrl || item.url;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onSelect(item); onClose(); }}
                    className="group relative aspect-square bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    <img src={displayUrl} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                    
                    {item.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/30">
                                <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                            </div>
                        </div>
                    )}

                    {/* Hover Info Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-left">
                       <p className="text-white text-xs font-bold truncate">{item.name}</p>
                       <p className="text-white/70 text-[10px] font-medium">{item.governance.status}</p>
                    </div>
                    
                    {/* Selection Indicator */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg text-white">
                        <Plus className="w-5 h-5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
