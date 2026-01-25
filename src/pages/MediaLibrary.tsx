
import React, { useEffect, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2 } from 'lucide-react';
import { store } from '../services/mockStore';
import { MediaItem } from '../types';

const MediaLibrary: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    store.getMedia().then(setMedia);
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      await store.uploadMedia(e.target.files[0]);
      const updated = await store.getMedia();
      setMedia(updated);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
        <label className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold cursor-pointer hover:bg-blue-700 transition-colors flex items-center gap-2">
          <UploadCloud size={20} />
          Upload Asset
          <input type="file" className="hidden" onChange={handleUpload} />
        </label>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {media.map((item) => (
          <div key={item.id} className="group relative aspect-square bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all">
            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        
        {/* Placeholder if empty */}
        {media.length === 0 && (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-2xl">
            <ImageIcon size={48} className="mb-4 opacity-50" />
            <p>No media uploaded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaLibrary;
