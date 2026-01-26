
import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Video, X, Loader2, Download, Save, RefreshCw } from 'lucide-react';
import { store } from '../services/mockStore';
import { MediaItem } from '../types';

interface CreativeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: MediaItem) => void;
  initialType?: 'image' | 'video';
}

export const CreativeGenerator: React.FC<CreativeGeneratorProps> = ({ isOpen, onClose, onSelect, initialType = 'image' }) => {
  const [prompt, setPrompt] = useState('');
  const [activeType, setActiveType] = useState<'image' | 'video'>(initialType);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAsset, setGeneratedAsset] = useState<MediaItem | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setGeneratedAsset(null); // Clear previous
    
    try {
      // Simulate slight network variation
      await new Promise(r => setTimeout(r, 1500));
      const asset = await store.generateAsset(prompt, activeType);
      setGeneratedAsset(asset);
    } catch (e) {
      console.error("Generation failed", e);
      alert("Failed to generate creative. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseAsset = () => {
    if (generatedAsset) {
      onSelect(generatedAsset);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg leading-none">AI Creative Studio</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Generate royalty-free assets instantly.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[500px]">
          {/* Controls Sidebar */}
          <div className="w-1/3 bg-slate-50 border-r border-slate-200 p-5 flex flex-col gap-6">
            
            {/* Type Selector */}
            <div className="flex bg-slate-200 p-1 rounded-xl">
              <button
                onClick={() => setActiveType('image')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeType === 'image' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <ImageIcon className="w-4 h-4" /> Image
              </button>
              <button
                onClick={() => setActiveType('video')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeType === 'video' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Video className="w-4 h-4" /> Video
              </button>
            </div>

            {/* Prompt Input */}
            <div className="flex-1 flex flex-col">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeType === 'image' ? "A futuristic workspace with neon lights..." : "A drone shot of a busy city street..."}
                className="w-full flex-1 p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm leading-relaxed"
              />
              <p className="text-[10px] text-slate-400 mt-2 text-right">{prompt.length} chars</p>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-slate-100 flex flex-col relative">
            <div className="flex-1 flex items-center justify-center p-8">
              {!generatedAsset && !isGenerating && (
                <div className="text-center text-slate-400">
                  <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="font-medium text-sm">Enter a prompt to start creating.</p>
                </div>
              )}

              {isGenerating && (
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-indigo-600 font-bold text-sm animate-pulse">Dreaming up your {activeType}...</p>
                </div>
              )}

              {generatedAsset && !isGenerating && (
                <div className="relative group w-full h-full flex items-center justify-center">
                  <div className="relative rounded-xl overflow-hidden shadow-2xl ring-4 ring-white max-h-full max-w-full">
                    {generatedAsset.type === 'image' ? (
                      <img src={generatedAsset.url} className="max-h-[360px] object-contain bg-black" />
                    ) : (
                      <video src={generatedAsset.url} className="max-h-[360px] object-contain bg-black" controls autoPlay loop muted />
                    )}
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md">
                      AI Generated
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            {generatedAsset && !isGenerating && (
              <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center animate-in slide-in-from-bottom-2">
                <div className="text-xs text-slate-500">
                  <span className="font-bold text-slate-700">Seed:</span> {generatedAsset.id.split('-').pop()}
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleGenerate}
                    className="px-4 py-2 text-slate-600 font-bold text-xs hover:bg-slate-100 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry
                  </button>
                  <button 
                    onClick={handleUseAsset}
                    className="px-6 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5" /> Save to Library
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
