import React, { useState } from 'react';
import { Sparkles, Send, Calendar as CalendarIcon, RotateCcw, Image as ImageIcon, X } from 'lucide-react';
import { generatePostContent } from '../services/geminiService';
import { store } from '../services/mockStore';
import { Platform, PostStatus } from '../types';

export const CreatorStudio: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<Platform>(Platform.Twitter);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tone, setTone] = useState('Professional');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([Platform.Twitter]);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    const content = await generatePostContent(topic, platform, tone);
    setGeneratedContent(content);
    setIsGenerating(false);
  };

  const togglePlatform = (p: Platform) => {
    if (selectedPlatforms.includes(p)) {
      setSelectedPlatforms(selectedPlatforms.filter(i => i !== p));
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handlePost = async () => {
    if (!generatedContent) return;
    await store.addPost({
      id: Date.now().toString(),
      content: generatedContent,
      platforms: selectedPlatforms,
      scheduledFor: new Date().toISOString(),
      status: PostStatus.Published,
      generatedByAi: true,
      engagement: { likes: 0, shares: 0, comments: 0 }
    });
    setTopic('');
    setGeneratedContent('');
    alert('Post published successfully to selected channels!');
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Left: Controls */}
      <div className="flex-1 space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Creator Studio
          </h1>
          <p className="text-slate-500">Generate high-converting content with Gemini AI.</p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          
          {/* Topic Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">What's this post about?</label>
            <textarea
              className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
              placeholder="e.g., Launching a new AI feature for image generation..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Primary Platform</label>
              <select 
                className="w-full p-2.5 border border-slate-300 rounded-lg"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
              >
                {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tone</label>
              <select 
                className="w-full p-2.5 border border-slate-300 rounded-lg"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option>Professional</option>
                <option>Funny</option>
                <option>Viral/Hype</option>
                <option>Educational</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic}
            className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
              isGenerating || !topic
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/25'
            }`}
          >
            {isGenerating ? (
              <>
                <RotateCcw className="w-5 h-5 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Draft
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right: Preview & Publish */}
      <div className="flex-1 flex flex-col">
        <div className="bg-slate-50 border border-slate-200 rounded-xl flex-1 p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Preview</h3>
          
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 p-6 relative">
            {!generatedContent ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-slate-300" />
                </div>
                <p>AI generated content will appear here</p>
              </div>
            ) : (
              <div className="animate-fade-in">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                    <div>
                      <div className="h-4 w-32 bg-slate-200 rounded mb-1"></div>
                      <div className="h-3 w-20 bg-slate-100 rounded"></div>
                    </div>
                 </div>
                 <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{generatedContent}</p>
                 <div className="mt-4 h-48 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="text-center text-slate-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                      <span className="text-sm">Click to add media</span>
                    </div>
                 </div>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-4">
             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Publish to:</label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(Platform).map(p => (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        selectedPlatforms.includes(p)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
               <button className="py-2.5 px-4 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 flex items-center justify-center gap-2">
                 <CalendarIcon className="w-4 h-4" /> Schedule
               </button>
               <button 
                onClick={handlePost}
                disabled={!generatedContent}
                className="py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                 <Send className="w-4 h-4" /> Publish Now
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
