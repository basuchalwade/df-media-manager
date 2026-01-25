
import React, { useState } from 'react';
import { Sparkles, Send, RefreshCw, Check } from 'lucide-react';
import { generatePostContent } from '../services/geminiService';
import { store } from '../services/mockStore';
import { Platform, PostStatus } from '../types';

const CreatorStudio: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([Platform.Twitter]);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    const result = await generatePostContent(topic, 'Twitter', tone);
    setContent(result);
    setIsGenerating(false);
  };

  const handleSave = async () => {
    if (!content) return;
    await store.addPost({
      id: Date.now().toString(),
      content,
      platforms: selectedPlatforms,
      status: PostStatus.Draft,
      scheduledFor: new Date().toISOString(),
      author: 'User'
    });
    alert('Draft saved!');
    setTopic('');
    setContent('');
  };

  return (
    <div className="flex gap-8 h-[calc(100vh-8rem)]">
      {/* Editor */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Sparkles className="text-yellow-500" /> AI Content Generator
        </h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Topic</label>
            <input 
              className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500" 
              placeholder="e.g. New Product Launch"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tone</label>
            <select 
              className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              <option>Professional</option>
              <option>Viral/Hype</option>
              <option>Witty</option>
              <option>Empathetic</option>
            </select>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !topic}
            className="w-full py-3 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isGenerating ? <RefreshCw className="animate-spin" /> : <Sparkles size={18} />}
            Generate Draft
          </button>
        </div>

        <div className="flex-1 relative">
          <textarea 
            className="w-full h-full resize-none p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
            placeholder="Generated content will appear here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={handleSave} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
            Save Draft
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
