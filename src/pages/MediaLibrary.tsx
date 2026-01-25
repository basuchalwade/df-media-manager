
import React, { useState } from 'react';
import { Image, Film, Filter, UploadCloud } from 'lucide-react';
import { store } from '../services/mockStore';

const MediaLibrary = () => {
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');

  const filteredAssets = store.assets.filter(a => filter === 'all' || a.type === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Media Library</h1>
        <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
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
                <span className="text-[10px] bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded uppercase font-bold">
                  {asset.platform}
                </span>
                {asset.type === 'video' ? <Film size={12} className="text-white" /> : <Image size={12} className="text-white" />}
              </div>
            </div>
          </div>
        ))}
        {/* Placeholder for upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
          <UploadCloud size={32} className="mb-2" />
          <span className="text-sm font-bold">Drop files here</span>
        </div>
      </div>
    </div>
  );
};

export default MediaLibrary;
