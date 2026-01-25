
import React, { useState } from 'react';
import { Sparkles, Send, Smartphone, Image as ImageIcon, RefreshCw, Copy, Plus } from 'lucide-react';
import { generatePostContent, generateHashtags, refinePostContent } from '../services/geminiService';
import { Platform, PostStatus } from '../types';
import { store } from '../services/mockStore';
import { PlatformIcon } from '../components/PlatformIcon';

interface CreatorStudioProps {
  onNavigate?: (page: string, params?: any) => void;
  params?: any;
}

export const CreatorStudio: React.FC<CreatorStudioProps> = ({ onNavigate, params }) => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [platform, setPlatform] = useState<Platform>(Platform.Twitter);
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    const text = await generatePostContent(topic, platform, tone, {});
    setContent(text);
    setIsGenerating(false);
  };

  const handleSave = () => {
    if (!content) return;
    store.addPost({
      id: Date.now().toString(),
      content,
      platforms: [platform],
      status: PostStatus.Draft,
      scheduledFor: new Date().toISOString(),
      author: 'User',
      generatedByAi: true
    });
    alert('Draft saved to storage!');
    setTopic('');
    setContent('');
  };

  const handleOptimize = async () => {
    if (!content) return;
    setIsGenerating(true);
    const refined = await refinePostContent(content, `Optimize for ${platform} with a ${tone} tone.`);
    setContent(refined);
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-8rem)]">
      {/* Left: Input & Editor */}
      <div className="flex-1 flex flex-col gap-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Creator Studio</h1>
          <p className="text-gray-500 text-sm mt-1">AI-powered content generation and optimization.</p>
        </header>

        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex-1 flex flex-col gap-5">
          {/* Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Platform</label>
              <div className="flex gap-2">
                {[Platform.Twitter, Platform.LinkedIn, Platform.Instagram].map(p => (
                  <button 
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`flex items-center justify-center p-2 rounded-xl border transition-all ${platform === p ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}
                  >
                    <PlatformIcon platform={p} size={18} white={platform === p} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Tone</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option>Professional</option>
                <option>Casual</option>
                <option>Viral</option>
                <option>Witty</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Topic / Prompt</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="e.g. New feature launch for our SaaS..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
                className="bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-lg shadow-gray-200"
              >
                {isGenerating ? <RefreshCw className="animate-spin" size={16}/> : <Sparkles size={16} />}
                Generate
              </button>
            </div>
          </div>

          <div className="flex-1 relative group">
            <textarea 
              className="w-full h-full bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all leading-relaxed"
              placeholder="AI Output will appear here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
               <button onClick={handleOptimize} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-purple-50 text-purple-600 shadow-sm transition-colors" title="Refine with AI">
                  <Sparkles size={16} />
               </button>
               <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 shadow-sm" title="Add Media">
                  <ImageIcon size={16} />
               </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button className="px-5 py-2.5 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded-xl transition-colors">Save as Draft</button>
            <button 
              onClick={handleSave}
              className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors flex items-center gap-2"
            >
              <Send size={16} /> Schedule Post
            </button>
          </div>
        </div>
      </div>

      {/* Right: Phone Preview */}
      <div className="w-full lg:w-[380px] flex flex-col gap-6">
        <div className="flex items-center gap-2 text-gray-500 px-2">
          <Smartphone size={18} />
          <span className="text-xs font-bold uppercase tracking-wide">Mobile Preview</span>
        </div>

        <div className="bg-white rounded-[3rem] border-[8px] border-gray-900 h-[700px] overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>
          
          <div className="h-full w-full bg-gray-50 overflow-y-auto custom-scrollbar">
            {/* Header Mock */}
            <div className="bg-white p-4 border-b border-gray-100 sticky top-0 z-10 flex justify-between items-center pt-10 px-6">
              <div className="w-8 h-8 rounded-full bg-gray-200"></div>
              <div className="font-bold text-sm">Feed</div>
              <div className="w-6"></div>
            </div>

            {/* Post Mock */}
            <div className="p-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                    CC
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">ContentCaster</p>
                    <p className="text-[10px] text-gray-500 font-medium">Just now • {platform}</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {content || <span className="text-gray-400 italic">Preview content...</span>}
                </p>

                <div className="mt-4 h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border border-gray-200 border-dashed">
                  <ImageIcon size={32} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
