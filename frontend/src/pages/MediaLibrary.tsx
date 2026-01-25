
import React, { useState, useEffect } from 'react';
import { Image, Film, Filter, UploadCloud, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { MediaItem } from '../types';

const MediaLibrary = () => {
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [assets, setAssets] = useState<MediaItem[]>([]);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = () => {
      api.getMedia().then(setAssets);
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    await api.uploadMedia(file);
    loadMedia();
  };

  const handleDelete = async (id: string) => {
      if(confirm('Delete this asset?')) {
          await api.deleteMedia(id);
          loadMedia();
      }
  }

  const filteredAssets = assets.filter(a => filter === 'all' || a.type === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Media Library</h1>
        <div className="relative">
            <input type="file" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors pointer-events-none">
            <UploadCloud size={18} /> Upload
            </button>
        </div>
      </header>

      <div className="flex gap-4 border-b border-gray-200 pb-4">
        {['all', 'image', 'video'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${
              filter === f ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredAssets.map(asset => (
          <div key={asset.id} className="group relative aspect-square bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer">
            <img src={asset.thumbnailUrl || asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <p className="text-white text-sm font-bold truncate">{asset.name}</p>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2">
                    {asset.type === 'video' ? <Film size={12} className="text-white" /> : <Image size={12} className="text-white" />}
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(asset.id); }} className="text-white hover:text-red-400">
                    <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaLibrary;
