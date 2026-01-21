import React, { useEffect, useState, useRef } from 'react';
import { X, Image as ImageIcon, FileVideo, UploadCloud, Plus, Loader2 } from 'lucide-react';
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
    // Batch process uploads
    for (const file of Array.from(files)) {
      try {
        await store.uploadMedia(file);
      } catch (err: any) {
        console.error("Upload failed for file " + file.name, err);
        // Alert only on first failure for simplicity or log it
        if (files.length === 1) alert(err.message || "Failed to upload file");
      }
    }
    
    // Refresh list
    await loadMedia();
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            Select Media
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UploadCloud className="w-4 h-4" />
              )}
              {isUploading ? 'Uploading...' : 'Upload New'}
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Hidden File Input with multiple attribute */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/png, image/jpeg, image/webp, video/mp4" 
          multiple
          onChange={handleFileUpload}
        />

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/50">
          {mediaItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-slate-300" />
              </div>
              <p className="mb-4 text-slate-500">No media found in library.</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 font-medium hover:underline flex items-center gap-1.5 px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4" /> Upload from device
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {mediaItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item); onClose(); }}
                  className="group relative aspect-square bg-white border border-slate-200 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 hover:border-transparent transition-all shadow-sm"
                >
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-black">
                      <video 
                        src={item.url} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100" 
                        muted 
                        loop
                        playsInline
                        onMouseOver={e => e.currentTarget.play().catch(() => {})} 
                        onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                      />
                      <div className="absolute top-1 right-1 p-0.5 bg-black/60 rounded text-white pointer-events-none">
                        <FileVideo className="w-3 h-3" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-100 p-2 text-left pointer-events-none">
                     <p className="text-xs font-medium text-slate-700 truncate">{item.name}</p>
                  </div>
                  
                  {/* Selection Indicator on Hover */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
