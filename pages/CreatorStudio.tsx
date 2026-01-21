import React, { useState } from 'react';
import { Sparkles, Send, Calendar as CalendarIcon, RotateCcw, Image as ImageIcon, ChevronDown, CheckCircle, Briefcase, Smile, Rocket, GraduationCap, X, FileVideo } from 'lucide-react';
import { generatePostContent } from '../services/geminiService';
import { store } from '../services/mockStore';
import { Platform, PostStatus, MediaItem } from '../types';
import { PlatformIcon } from '../components/PlatformIcon';
import { MediaPicker } from '../components/MediaPicker';

export const CreatorStudio: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<Platform>(Platform.Twitter);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tone, setTone] = useState('Professional');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([Platform.Twitter]);
  
  // Media State
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  
  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    const content = await generatePostContent(topic, platform, tone);
    setGeneratedContent(content);
    setIsGenerating(false);
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
      mediaUrl: selectedMedia?.url,
      mediaType: selectedMedia?.type, // Added explicit media type save
      engagement: { likes: 0, shares: 0, comments: 0 }
    });
    setTopic('');
    setGeneratedContent('');
    setSelectedMedia(null);
    alert('Published successfully.');
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
         <h1 className="text-[34px] font-bold text-[#1d1d1f] tracking-tight">Studio</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 h-full">
        {/* Input Panel - Paper like */}
        <div className="w-full lg:w-[420px] bg-white rounded-[32px] p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-black/5 flex flex-col gap-6 h-fit">
           
           <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">What's on your mind?</label>
              <textarea
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:bg-gray-100 transition-colors text-base font-medium resize-none leading-relaxed"
                placeholder="Describe your post idea..."
                rows={4}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
           </div>

           <div className="space-y-4">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Configuration</label>
              
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">Platform</span>
                    <select 
                       value={platform} 
                       onChange={(e) => setPlatform(e.target.value as Platform)}
                       className="bg-transparent text-sm font-bold text-gray-900 outline-none"
                    >
                       {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                 </div>
                 <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">Tone</span>
                    <select 
                       value={tone} 
                       onChange={(e) => setTone(e.target.value)}
                       className="bg-transparent text-sm font-bold text-gray-900 outline-none"
                    >
                       {['Professional', 'Funny', 'Viral', 'Educational'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                 </div>
              </div>
           </div>

           <button
             onClick={handleGenerate}
             disabled={isGenerating || !topic}
             className="w-full py-4 bg-black text-white rounded-2xl font-bold text-[15px] hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50"
           >
             {isGenerating ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-yellow-300" />}
             {isGenerating ? 'Thinking...' : 'Generate with Gemini'}
           </button>
        </div>

        {/* Preview Panel - Device like */}
        <div className="flex-1 bg-[#F5F5F7] rounded-[32px] border border-black/5 flex flex-col relative overflow-hidden">
           
           <div className="flex-1 p-8 flex items-center justify-center">
              {!generatedContent ? (
                 <div className="text-center opacity-40">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                       <Sparkles className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">Content preview will appear here</p>
                 </div>
              ) : (
                 <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-6 animate-in zoom-in-95 duration-500 border border-white/40">
                    <div className="flex items-center gap-3 mb-4">
                       <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <PlatformIcon platform={platform} size={20} />
                       </div>
                       <div>
                          <p className="font-bold text-gray-900 text-sm">Your Page</p>
                          <p className="text-xs text-gray-400">Just now</p>
                       </div>
                    </div>
                    
                    <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">{generatedContent}</p>

                    {selectedMedia && (
                       <div className="mt-4 rounded-2xl overflow-hidden border border-gray-100 relative group bg-black">
                          {selectedMedia.type === 'image' ? (
                             <img src={selectedMedia.url} className="w-full object-cover max-h-[300px]" alt="media" />
                          ) : (
                             <video 
                                src={selectedMedia.url} 
                                className="w-full max-h-[300px]" 
                                controls 
                             />
                          )}
                          <button 
                             onClick={() => setSelectedMedia(null)} 
                             className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md z-10"
                          >
                             <X className="w-4 h-4"/>
                          </button>
                       </div>
                    )}
                 </div>
              )}
           </div>

           {/* Action Bar */}
           <div className="bg-white/80 backdrop-blur-xl border-t border-black/5 p-4 flex items-center justify-between">
              <div className="flex gap-2">
                 <button 
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors"
                 >
                    <ImageIcon className="w-5 h-5" />
                 </button>
                 <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors">
                    <CalendarIcon className="w-5 h-5" />
                 </button>
              </div>

              <div className="flex gap-2">
                 <button 
                    onClick={handlePost}
                    disabled={!generatedContent}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
                 >
                    <Send className="w-4 h-4" /> Publish
                 </button>
              </div>
           </div>

        </div>
      </div>
      
      <MediaPicker isOpen={isMediaPickerOpen} onClose={() => setIsMediaPickerOpen(false)} onSelect={setSelectedMedia} />
    </div>
  );
};