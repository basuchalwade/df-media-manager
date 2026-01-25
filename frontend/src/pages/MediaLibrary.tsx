
import React, { useState, useEffect } from 'react';
import { Image, Film, Filter, UploadCloud } from 'lucide-react';
import { api } from '../services/api';
import { MediaItem } from '../types';

const MediaLibrary = () => {
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [assets, setAssets] = useState<MediaItem[]>([]);

  useEffect(() => {
    api.getMedia().then(setAssets);
  }, []);

  const handleUpload = async () => {
    await api.uploadMedia(new File([""], "test.jpg")); // Mock upload
    api.getMedia().then(setAssets);
  };

  const filteredAssets = assets.filter(a => filter === 'all' || a.type === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Media Library</h1>
        <button onClick={handleUpload} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <UploadCloud size={18} /> Upload
        </button>
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
            <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <p className="text-white text-sm font-bold truncate">{asset.name}</p>
              <div className="flex items-center gap-2 mt-1">
                {asset.type === 'video' ? <Film size={12} className="text-white" /> : <Image size={12} className="text-white" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaLibrary;
