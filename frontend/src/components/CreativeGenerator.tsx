
import React, { useState } from 'react';
import { Sparkles, X, Image as ImageIcon, Film, Loader2, Download, Check } from 'lucide-react';
import { api } from '../services/api';
import { store } from '../services/mockStore';
import { MediaItem } from '../types';

interface CreativeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (media: MediaItem) => void;
  initialPrompt?: string;
  context?: string; // e.g. 'Campaign X', 'Post Y'
}

export const CreativeGenerator: React.FC<CreativeGeneratorProps> = ({ isOpen, onClose, onSuccess, initialPrompt = '', context }) => {
  const [mode, setMode] = useState<'image' | 'video'>('image');
  const [prompt, setPrompt] = useState(initialPrompt);
  const [style, setStyle] = useState('Photorealistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultType, setResultType] = useState<string>('');

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setResultUrl(null);

    try {
      const result = await api.generateAsset(mode, prompt, style);
      setResultUrl(result.url);
      setResultType(result.mimeType);
    } catch (e) {
      console.error(e);
      alert("Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!resultUrl) return;
    
    // Simulate file creation from URL
    try {
        const response = await fetch(resultUrl);
        const blob = await response.blob();
        const ext = mode === 'image' ? 'jpg' : 'mp4';
        const file = new File([blob], `ai-generated-${Date.now()}.${ext}`, { type: resultType });
        
        // Save to centralized store
        const savedMedia = await store.uploadMedia(file);
        
        // Callback
        onSuccess(savedMedia);
        onClose();
    } catch (e) {
        console.error("Failed to save asset", e);
        alert("Could not save to library");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] flex overflow-hidden">
        
        {/* Sidebar Controls */}
        <div className="w-80 bg-slate-50 border-r border-slate-200 p-6 flex flex-col gap-6">
            <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
                    <Sparkles className="w-5 h-5 text-purple-600" /> AI Studio
                </h3>
                <p className="text-xs text-slate-500">Generate assets for {context || 'your library'}</p>
            </div>

            <div className="flex bg-slate-200 p-1 rounded-lg">
                <button 
                    onClick={() => { setMode('image'); setResultUrl(null); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'image' ? 'bg-white shadow text-purple-700' : 'text-slate-500'}`}
                >
                    <ImageIcon className="w-3 h-3" /> Image
                </button>
                <button 
                    onClick={() => { setMode('video'); setResultUrl(null); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'video' ? 'bg-white shadow text-blue-700' : 'text-slate-500'}`}
                >
                    <Film className="w-3 h-3" /> Video
                </button>
            </div>

            <div className="flex-1 space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Prompt</label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full h-32 p-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                        placeholder={mode === 'image' ? "A futuristic cityscape with neon lights..." : "Cinematic drone shot of mountains..."}
                    />
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Style</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['Photorealistic', 'Cinematic', '3D Render', 'Minimalist'].map(s => (
                            <button
                                key={s}
                                onClick={() => setStyle(s)}
                                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${style === s ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-slate-200 text-slate-600 hover:border-purple-200'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-purple-400" />}
                {isGenerating ? 'Dreaming...' : 'Generate'}
            </button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-slate-100 flex flex-col relative">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full z-10 transition-colors">
                <X className="w-5 h-5" />
            </button>

            <div className="flex-1 flex items-center justify-center p-8">
                {resultUrl ? (
                    <div className="relative w-full h-full max-h-[400px] rounded-xl overflow-hidden shadow-2xl ring-1 ring-black/5 bg-black">
                        {mode === 'image' ? (
                            <img src={resultUrl} className="w-full h-full object-contain" alt="Generated" />
                        ) : (
                            <video src={resultUrl} className="w-full h-full object-contain" controls autoPlay loop />
                        )}
                    </div>
                ) : (
                    <div className="text-center text-slate-400">
                        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            {isGenerating ? <Loader2 className="w-10 h-10 animate-spin text-purple-500" /> : <Sparkles className="w-10 h-10" />}
                        </div>
                        <p className="font-medium">{isGenerating ? 'AI is working magic...' : 'Ready to create'}</p>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            {resultUrl && (
                <div className="p-6 bg-white border-t border-slate-200 flex justify-between items-center">
                    <div className="text-sm text-slate-500">
                        Generated with <strong>Gemini 3 Pro</strong>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setResultUrl(null)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-black">Discard</button>
                        <button 
                            onClick={handleSave}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" /> Save & Use
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
