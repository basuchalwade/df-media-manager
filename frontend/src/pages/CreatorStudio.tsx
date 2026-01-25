
import React, { useState } from 'react';
import { Sparkles, Send, Smartphone, Image as ImageIcon, RefreshCw, Copy, Plus } from 'lucide-react';
import { api } from '../services/api';

const CreatorStudio = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState('');
  
  const handleGenerate = () => {
    if (!prompt) return;
    setIsGenerating(true);
    setTimeout(() => {
      setContent(`🚀 Exciting news! We just launched ${prompt} and it's going to change the game. \n\n#Innovation #Tech #Growth`);
      setIsGenerating(false);
    }, 1500);
  };

  const handleSave = async () => {
    await api.addPost({
      content,
      platform: 'Twitter',
      status: 'Draft'
    });
    alert('Saved to drafts on Server!');
    setContent('');
    setPrompt('');
  };

  return (
    <div className="flex gap-8 h-[calc(100vh-8rem)] animate-fade-in">
      {/* Editor */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="text-purple-600" /> AI Assistant
          </h2>
          <div className="flex gap-2">
            {['Twitter', 'LinkedIn', 'Instagram'].map(p => (
              <button key={p} className="text-xs font-bold px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors">
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <label className="block text-xs font-bold text-gray-500 uppercase">What should we write about?</label>
          <div className="flex gap-2">
            <input 
              className="flex-1 p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-purple-500 transition-all" 
              placeholder="e.g. New feature launch..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 bg-black text-white rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors"
            >
              {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
              Generate
            </button>
          </div>
        </div>

        <div className="flex-1 relative group">
          <textarea 
            className="w-full h-full resize-none p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-purple-500 transition-all text-gray-700 leading-relaxed"
            placeholder="AI Output will appear here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">Save as Draft</button>
          <button onClick={handleSave} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Send size={18} /> Schedule
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="w-[350px] bg-gray-900 rounded-[40px] p-4 shadow-2xl border-4 border-gray-800 hidden lg:block">
        <div className="h-full bg-white rounded-[32px] overflow-hidden relative">
          <div className="h-8 bg-gray-100 flex items-center justify-center">
            <div className="w-20 h-4 bg-gray-300 rounded-full" />
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div>
                <div className="w-24 h-3 bg-gray-200 rounded mb-1" />
                <div className="w-16 h-2 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              {content ? (
                <p className="text-sm text-gray-800">{content}</p>
              ) : (
                <>
                  <div className="w-full h-3 bg-gray-100 rounded" />
                  <div className="w-full h-3 bg-gray-100 rounded" />
                  <div className="w-3/4 h-3 bg-gray-100 rounded" />
                  <div className="w-full h-32 bg-gray-100 rounded-xl mt-4" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorStudio;
