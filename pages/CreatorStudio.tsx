import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Calendar as CalendarIcon, RotateCcw, Image as ImageIcon, ChevronDown, CheckCircle, Briefcase, Smile, Rocket, GraduationCap, X, FileVideo, Clock, Save, AlertCircle, Check, Zap, Eye, Copy, Hash, MoreHorizontal, ThumbsUp, MessageSquare, Share2, Repeat, Bookmark, Globe, Heart } from 'lucide-react';
import { generatePostContent } from '../services/geminiService';
import { store } from '../services/mockStore';
import { Platform, PostStatus, MediaItem, Post } from '../types';
import { PlatformIcon } from '../components/PlatformIcon';
import { MediaPicker } from '../components/MediaPicker';

// --- Constants ---

const PLATFORM_LIMITS: Record<Platform, number> = {
  [Platform.Twitter]: 280,
  [Platform.LinkedIn]: 3000,
  [Platform.Instagram]: 2200,
  [Platform.Facebook]: 63206,
  [Platform.Threads]: 500,
  [Platform.YouTube]: 5000,
  [Platform.Discord]: 2000,
};

const TONES = ['Professional', 'Funny', 'Viral', 'Educational', 'Empathetic', 'Controversial'];

const HASHTAG_SUGGESTIONS = ['#TechTrends', '#Innovation', '#FutureOfWork', '#AI', '#Growth', '#StartupLife'];
const EMOJI_LIST = ['🚀', '💡', '🔥', '✨', '🤖', '📈', '💪', '🎯'];

export const CreatorStudio: React.FC = () => {
  // --- AI State ---
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPlatform, setGenerationPlatform] = useState<Platform>(Platform.Twitter);

  // --- Composer State ---
  const [content, setContent] = useState('');
  const [youtubeTitle, setYoutubeTitle] = useState(''); // Specific for YouTube
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([Platform.Twitter]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  
  // --- Tools State ---
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showHashtags, setShowHashtags] = useState(false);
  
  // --- Scheduling State ---
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [timeState, setTimeState] = useState({ hour: '09', minute: '00', period: 'AM' });
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // --- Automation State ---
  const [autoEngage, setAutoEngage] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  // --- UI State ---
  const [previewPlatform, setPreviewPlatform] = useState<Platform>(Platform.Twitter);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Sync preview platform
  useEffect(() => {
    if (selectedPlatforms.length > 0 && !selectedPlatforms.includes(previewPlatform)) {
      setPreviewPlatform(selectedPlatforms[0]);
    }
  }, [selectedPlatforms]);

  // Validation Logic
  useEffect(() => {
    const errors: string[] = [];
    selectedPlatforms.forEach(p => {
      const limit = PLATFORM_LIMITS[p];
      if (content.length > limit) {
        errors.push(`${p} limit exceeded (${content.length}/${limit})`);
      }
      if (p === Platform.YouTube && !youtubeTitle) {
        errors.push("YouTube requires a video title.");
      }
      if (p === Platform.Instagram && selectedMedia && selectedMedia.type !== 'image' && selectedMedia.type !== 'video') {
         // Mock aspect ratio check
      }
    });
    setValidationErrors(errors);
  }, [content, selectedPlatforms, youtubeTitle, selectedMedia]);

  // --- Handlers ---

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    const contextPlatform = selectedPlatforms.length > 0 ? selectedPlatforms[0] : generationPlatform;
    const generated = await generatePostContent(topic, contextPlatform, tone);
    setContent(generated);
    if(contextPlatform === Platform.YouTube) setYoutubeTitle(`${topic} - Official Video`);
    setIsAiGenerated(true);
    setIsGenerating(false);
  };

  const handleInsertText = (text: string) => {
    setContent(prev => prev + (prev.length > 0 ? ' ' : '') + text);
    setShowEmojiPicker(false);
    setShowHashtags(false);
  };

  const constructPostObject = (status: PostStatus): Post => {
    let finalDate = new Date();
    if (scheduleMode === 'later') {
      finalDate = new Date(scheduledDate);
      let hours = parseInt(timeState.hour);
      if (timeState.period === 'PM' && hours !== 12) hours += 12;
      else if (timeState.period === 'AM' && hours === 12) hours = 0;
      finalDate.setHours(hours, parseInt(timeState.minute), 0, 0);
    }

    return {
      id: Date.now().toString(),
      title: youtubeTitle,
      content: content,
      platforms: selectedPlatforms,
      scheduledFor: finalDate.toISOString(),
      status: status,
      generatedByAi: isAiGenerated,
      mediaUrl: selectedMedia?.url,
      mediaType: selectedMedia?.type,
      engagement: { likes: 0, shares: 0, comments: 0 }
    };
  };

  const handlePublish = async () => {
    if (validationErrors.length > 0 || !content) return;
    setIsSaving(true);
    const status = scheduleMode === 'now' ? PostStatus.Published : PostStatus.Scheduled;
    const newPost = constructPostObject(status);
    await store.addPost(newPost);
    alert(scheduleMode === 'now' ? 'Published successfully!' : 'Scheduled successfully!');
    resetForm();
    setIsSaving(false);
  };

  const handleSaveDraft = async () => {
    if (!content) return;
    setIsSaving(true);
    const newPost = constructPostObject(PostStatus.Draft);
    await store.addPost(newPost);
    alert('Saved to drafts.');
    setIsSaving(false);
  };

  const handleDuplicate = () => {
    // Logic just to keep content but maybe change platform
    alert("Draft duplicated! You can now edit this version.");
  };

  const resetForm = () => {
    setContent('');
    setYoutubeTitle('');
    setTopic('');
    setSelectedMedia(null);
    setIsAiGenerated(false);
    setSelectedPlatforms([Platform.Twitter]);
    setValidationErrors([]);
    setScheduleMode('now');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFormattedDateValue = (date: Date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Preview Truncation
  const previewLimit = PLATFORM_LIMITS[previewPlatform] || 500;
  const displayContent = content ? content.slice(0, previewLimit) : '';
  const isTruncated = content.length > previewLimit;

  // Render Logic for specific platforms
  const renderPreviewContent = () => {
    const commonMedia = selectedMedia && (
        <div className="w-full bg-black flex items-center justify-center relative overflow-hidden bg-gray-100">
           {selectedMedia.type === 'image' ? (
              <img src={selectedMedia.url} className="w-full h-full object-cover" alt="Preview" />
           ) : (
              <video src={selectedMedia.url} className="w-full h-full object-cover" controls />
           )}
        </div>
    );

    switch (previewPlatform) {
      case Platform.Twitter:
        return (
          <div className="bg-white">
            <div className="px-4 py-3 flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-[15px] leading-5">
                   <span className="font-bold text-gray-900">Your Brand</span>
                   <span className="text-gray-500">@brand</span>
                   <span className="text-gray-500">·</span>
                   <span className="text-gray-500">2h</span>
                </div>
                <div className="mt-1 text-[15px] text-gray-900 leading-normal whitespace-pre-wrap break-words">
                   {displayContent || <span className="text-gray-300">Your post text...</span>}
                </div>
                {selectedMedia && <div className="mt-3 rounded-2xl overflow-hidden border border-gray-100">{commonMedia}</div>}
                
                <div className="flex justify-between mt-3 text-gray-500 max-w-md pr-4">
                   <MessageSquare className="w-4 h-4" />
                   <Repeat className="w-4 h-4" />
                   <Heart className="w-4 h-4" />
                   <Share2 className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        );

      case Platform.Instagram:
        return (
          <div className="bg-white">
            <div className="flex items-center justify-between px-3 py-2">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                   <div className="w-full h-full bg-white rounded-full p-[2px]">
                     <div className="w-full h-full bg-gray-200 rounded-full"></div>
                   </div>
                 </div>
                 <span className="text-sm font-semibold">your_brand</span>
               </div>
               <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </div>
            
            <div className="aspect-square bg-gray-100">
               {selectedMedia ? (
                 selectedMedia.type === 'image' ? <img src={selectedMedia.url} className="w-full h-full object-cover" /> : <video src={selectedMedia.url} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">No Media</div>
               )}
            </div>

            <div className="p-3">
               <div className="flex justify-between mb-2">
                  <div className="flex gap-4">
                     <Heart className="w-6 h-6 text-black" />
                     <MessageSquare className="w-6 h-6 text-black" />
                     <Send className="w-6 h-6 text-black" />
                  </div>
                  <Bookmark className="w-6 h-6 text-black" />
               </div>
               <div className="font-semibold text-sm mb-1">1,234 likes</div>
               <div className="text-sm">
                  <span className="font-semibold mr-2">your_brand</span>
                  <span className="whitespace-pre-wrap">{displayContent}</span>
               </div>
            </div>
          </div>
        );
      
      case Platform.LinkedIn:
        return (
          <div className="bg-white border-y border-gray-200 mt-2">
             <div className="px-4 py-3 flex gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                <div>
                   <div className="text-sm font-semibold text-gray-900">Your Name</div>
                   <div className="text-xs text-gray-500">Marketing Director at Brand</div>
                   <div className="text-xs text-gray-500 flex items-center gap-1">2h • <Globe className="w-3 h-3" /></div>
                </div>
             </div>
             <div className="px-4 pb-2 text-sm text-gray-900 whitespace-pre-wrap break-words">
                {displayContent}
             </div>
             {selectedMedia && <div className="w-full">{commonMedia}</div>}
             <div className="px-4 py-2 border-t border-gray-100 flex justify-between">
                {['Like', 'Comment', 'Repost', 'Send'].map(action => (
                   <div key={action} className="flex flex-col items-center justify-center px-2 py-1 hover:bg-gray-100 rounded cursor-pointer text-gray-500">
                      <span className="text-xs font-semibold">{action}</span>
                   </div>
                ))}
             </div>
          </div>
        );

      case Platform.YouTube:
        return (
          <div className="bg-white h-full flex flex-col">
             <div className="aspect-video bg-black w-full flex items-center justify-center">
                {selectedMedia ? (
                   selectedMedia.type === 'image' ? <img src={selectedMedia.url} className="w-full h-full object-cover opacity-80" /> : <video src={selectedMedia.url} className="w-full h-full object-cover" />
                ) : (
                   <div className="text-gray-500">Video Player</div>
                )}
             </div>
             <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 line-clamp-2">{youtubeTitle || "Video Title Goes Here"}</h3>
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200"></div>
                      <div>
                         <div className="text-sm font-semibold text-gray-800">Your Channel</div>
                         <div className="text-xs text-gray-500">100K subscribers</div>
                      </div>
                   </div>
                   <button className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase">Subscribe</button>
                </div>
                <div className="bg-gray-100 rounded-xl p-3 text-sm text-gray-700 whitespace-pre-wrap">
                   <span className="font-semibold">15K views • 2 hours ago</span>
                   <br />
                   {displayContent}
                </div>
             </div>
          </div>
        );

      default:
         // Generic Facebook/Thread style
         return (
          <div className="bg-white p-4">
             <div className="flex gap-3 mb-3">
               <div className="w-10 h-10 rounded-full bg-gray-200"></div>
               <div>
                  <div className="font-bold text-gray-900 text-sm">Your Brand</div>
                  <div className="text-xs text-gray-500">Just now</div>
               </div>
             </div>
             <div className="mb-3 text-sm text-gray-800 whitespace-pre-wrap">{displayContent}</div>
             {selectedMedia && <div className="rounded-lg overflow-hidden border border-gray-100">{commonMedia}</div>}
             <div className="flex justify-between mt-3 pt-3 border-t border-gray-100 text-gray-500 text-sm font-semibold">
                <span>Like</span>
                <span>Comment</span>
                <span>Share</span>
             </div>
          </div>
         );
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
           <h1 className="text-[34px] font-bold text-[#1d1d1f] tracking-tight">Creator Studio</h1>
           <p className="text-gray-500 font-medium">Draft, optimize, and schedule your content across channels.</p>
         </div>
         <div className="flex gap-2">
            <button 
               onClick={handleDuplicate}
               className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-full shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
            >
               <Copy className="w-4 h-4" /> Duplicate
            </button>
            <button 
               onClick={handleSaveDraft}
               className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-full shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
               <Save className="w-4 h-4" /> Save Draft
            </button>
         </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 h-full">
        
        {/* LEFT COLUMN: Editor & Configuration */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
           
           {/* AI Assistant Card */}
           <div className="bg-white rounded-[32px] p-6 shadow-sm border border-black/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none"></div>
              
              <div className="flex items-center gap-2 mb-4">
                 <Sparkles className="w-5 h-5 text-yellow-500 fill-current" />
                 <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">AI Assistant</h2>
              </div>
              
              <div className="flex flex-col gap-4">
                 <div className="flex gap-4">
                    <div className="flex-1">
                       <input 
                         type="text" 
                         value={topic}
                         onChange={(e) => setTopic(e.target.value)}
                         placeholder="What do you want to post about?"
                         className="w-full bg-gray-50 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                       />
                    </div>
                    <div className="w-40 shrink-0">
                       <select 
                          value={tone}
                          onChange={(e) => setTone(e.target.value)}
                          className="w-full h-full bg-gray-50 border-transparent focus:border-blue-500 focus:bg-white rounded-xl px-4 text-sm font-bold text-gray-700 cursor-pointer"
                       >
                          {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                    </div>
                 </div>
                 <button 
                   onClick={handleGenerate}
                   disabled={isGenerating || !topic}
                   className="w-full py-3 bg-black text-white rounded-xl font-bold text-sm shadow-lg shadow-black/10 hover:bg-gray-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                    {isGenerating ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-yellow-300" />}
                    {isGenerating ? 'Generating Magic...' : 'Generate Content'}
                 </button>
              </div>
           </div>

           {/* Main Composer */}
           <div className="bg-white rounded-[32px] p-6 shadow-sm border border-black/5 flex-1 flex flex-col gap-6">
              
              {/* Platform Selector */}
              <div>
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Target Platforms</label>
                 <div className="flex flex-wrap gap-2">
                    {Object.values(Platform).map(p => {
                       const isSelected = selectedPlatforms.includes(p);
                       return (
                          <button
                             key={p}
                             onClick={() => isSelected 
                                ? setSelectedPlatforms(prev => prev.filter(i => i !== p)) 
                                : setSelectedPlatforms(prev => [...prev, p])
                             }
                             className={`
                                flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-200 text-xs font-bold
                                ${isSelected 
                                   ? 'bg-black text-white border-black shadow-md' 
                                   : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                             `}
                          >
                             <PlatformIcon platform={p} size={14} white={isSelected} />
                             {p}
                          </button>
                       );
                    })}
                 </div>
                 {selectedPlatforms.includes(Platform.Instagram) && (
                    <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg inline-flex items-center gap-2 font-medium">
                       <AlertCircle className="w-3 h-3" /> Instagram Warning: Ensure media is 1:1 or 4:5 aspect ratio.
                    </div>
                 )}
              </div>
              
              {/* Conditional YouTube Title */}
              {selectedPlatforms.includes(Platform.YouTube) && (
                 <div className="animate-in slide-in-from-top-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Video Title <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={youtubeTitle}
                      onChange={(e) => setYoutubeTitle(e.target.value)}
                      placeholder="Enter an engaging title for your video..."
                      className="w-full bg-gray-50 border-transparent focus:border-red-500 focus:bg-white rounded-xl px-4 py-3 text-sm font-bold text-gray-900 transition-colors"
                    />
                 </div>
              )}

              {/* Editor */}
              <div className="flex-1 min-h-[200px] flex flex-col relative">
                 <div className="flex justify-between items-end mb-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Post Content</label>
                    
                    {/* Character Counters */}
                    <div className="flex flex-wrap justify-end gap-1.5">
                       {selectedPlatforms.map(p => {
                          const limit = PLATFORM_LIMITS[p];
                          const count = content.length;
                          const isOver = count > limit;
                          
                          return (
                             <div key={p} className={`
                                flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold transition-colors
                                ${isOver ? 'bg-red-50 border-red-100 text-red-600' : 'bg-white border-gray-200 text-gray-500'}
                             `}>
                                <PlatformIcon platform={p} size={10} />
                                <span>{count}/{limit}</span>
                                {isOver ? <AlertCircle className="w-3 h-3" /> : <Check className="w-3 h-3 text-green-500" />}
                             </div>
                          );
                       })}
                    </div>
                 </div>
                 
                 <div className="relative flex-1">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your masterpiece..."
                        className={`
                        w-full h-full min-h-[160px] bg-gray-50 rounded-2xl p-5 pb-12 text-gray-900 placeholder:text-gray-400 border-none focus:ring-2 transition-colors resize-none leading-relaxed text-base
                        ${validationErrors.length > 0 ? 'focus:ring-red-500/20 ring-2 ring-red-500/10' : 'focus:ring-blue-500/20 focus:bg-white'}
                        `}
                    />
                    
                    {/* Toolbar */}
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                        <div className="flex gap-1">
                            <button onClick={() => setIsMediaPickerOpen(true)} className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-blue-600 transition-colors" title="Add Media">
                                <ImageIcon className="w-4 h-4" />
                            </button>
                            <div className="relative">
                                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-yellow-500 transition-colors" title="Add Emoji">
                                    <Smile className="w-4 h-4" />
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute bottom-full left-0 mb-2 bg-white shadow-xl border border-gray-100 rounded-xl p-2 grid grid-cols-4 gap-1 z-20 w-48">
                                        {EMOJI_LIST.map(e => <button key={e} onClick={() => handleInsertText(e)} className="hover:bg-gray-100 p-2 rounded text-xl">{e}</button>)}
                                    </div>
                                )}
                            </div>
                            <div className="relative">
                                <button onClick={() => setShowHashtags(!showHashtags)} className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-blue-500 transition-colors" title="Add Hashtags">
                                    <Hash className="w-4 h-4" />
                                </button>
                                {showHashtags && (
                                    <div className="absolute bottom-full left-0 mb-2 bg-white shadow-xl border border-gray-100 rounded-xl p-2 flex flex-col gap-1 z-20 w-40">
                                        {HASHTAG_SUGGESTIONS.map(h => 
                                            <button key={h} onClick={() => handleInsertText(h)} className="text-left px-3 py-1.5 hover:bg-blue-50 text-xs font-bold text-blue-600 rounded-lg">{h}</button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button className="p-2 bg-white rounded-lg shadow-sm text-gray-500 hover:text-purple-600 border border-gray-200 transition-colors" title="AI Rewrite">
                           <Zap className="w-4 h-4" />
                        </button>
                    </div>
                 </div>
              </div>

              {/* Media Preview */}
              {selectedMedia && (
                 <div className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-md group">
                    <button 
                       onClick={() => setSelectedMedia(null)}
                       className="absolute top-3 right-3 p-1.5 bg-black/50 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                       <X className="w-4 h-4" />
                    </button>
                    <div className="flex h-32">
                       <div className="w-32 shrink-0 bg-black flex items-center justify-center">
                          {selectedMedia.type === 'image' ? (
                             <img src={selectedMedia.url} className="w-full h-full object-cover" alt="Selected" />
                          ) : (
                             <video src={selectedMedia.url} className="w-full h-full object-cover" />
                          )}
                       </div>
                       <div className="flex-1 bg-gray-50 p-4 flex flex-col justify-center border-l border-gray-200">
                          <p className="font-bold text-gray-900 text-sm truncate">{selectedMedia.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{selectedMedia.type.toUpperCase()} • {formatBytes(selectedMedia.size)}</p>
                       </div>
                    </div>
                 </div>
              )}
           </div>

           {/* Scheduling & Publish */}
           <div className="bg-white rounded-[32px] p-6 shadow-sm border border-black/5 space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                    <button 
                       onClick={() => setScheduleMode('now')}
                       className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${scheduleMode === 'now' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                       Publish Now
                    </button>
                    <button 
                       onClick={() => setScheduleMode('later')}
                       className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${scheduleMode === 'later' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                       Schedule
                    </button>
                 </div>
                 
                 {/* Auto-Engage Toggle */}
                 <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bot Actions</span>
                    <button 
                       onClick={() => setAutoEngage(!autoEngage)}
                       className={`relative w-10 h-6 rounded-full transition-colors ${autoEngage ? 'bg-green-500' : 'bg-gray-200'}`}
                       title="Auto-Reply Engagement Bot"
                    >
                       <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${autoEngage ? 'translate-x-4' : ''}`} />
                    </button>
                 </div>
              </div>

              {scheduleMode === 'later' && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                    <label className="relative flex items-center bg-gray-50 rounded-xl p-3 border border-gray-200 group hover:border-blue-300 transition-colors cursor-pointer">
                       <CalendarIcon className="w-5 h-5 text-gray-400 mr-3 group-hover:text-blue-500 transition-colors pointer-events-none" />
                       <span className="text-sm font-bold text-gray-900 pointer-events-none">
                          {scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                       </span>
                       <input 
                          ref={dateInputRef}
                          type="date"
                          min={getFormattedDateValue(new Date())}
                          value={getFormattedDateValue(scheduledDate)}
                          onChange={(e) => {
                             if(e.target.value) {
                                const parts = e.target.value.split('-').map(Number);
                                setScheduledDate(new Date(parts[0], parts[1]-1, parts[2], 12, 0, 0));
                             }
                          }}
                          onClick={(e) => {try{e.currentTarget.showPicker()}catch(err){}}}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                       />
                    </label>
                    <div className="relative">
                       <button 
                          onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
                          className="w-full flex items-center bg-gray-50 rounded-xl p-3 border border-gray-200 hover:border-blue-300 transition-colors"
                       >
                          <Clock className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-sm font-bold text-gray-900 flex-1 text-left">{timeState.hour}:{timeState.minute} {timeState.period}</span>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                       </button>

                       {isTimePickerOpen && (
                          <div className="absolute bottom-full mb-2 left-0 w-full bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-20 grid grid-cols-3 gap-2">
                             <select 
                                value={timeState.hour} 
                                onChange={(e) => setTimeState({...timeState, hour: e.target.value})}
                                className="bg-gray-50 rounded-lg p-2 text-center font-bold"
                             >
                                {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                             </select>
                             <select 
                                value={timeState.minute} 
                                onChange={(e) => setTimeState({...timeState, minute: e.target.value})}
                                className="bg-gray-50 rounded-lg p-2 text-center font-bold"
                             >
                                {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                             </select>
                             <div className="flex flex-col gap-1">
                                <button 
                                   onClick={() => setTimeState({...timeState, period: 'AM'})} 
                                   className={`text-[10px] font-bold rounded py-1 ${timeState.period === 'AM' ? 'bg-black text-white' : 'bg-gray-100'}`}
                                >AM</button>
                                <button 
                                   onClick={() => setTimeState({...timeState, period: 'PM'})} 
                                   className={`text-[10px] font-bold rounded py-1 ${timeState.period === 'PM' ? 'bg-black text-white' : 'bg-gray-100'}`}
                                >PM</button>
                             </div>
                             <button onClick={() => setIsTimePickerOpen(false)} className="col-span-3 mt-2 bg-blue-50 text-blue-600 text-xs font-bold py-2 rounded-lg">Set Time</button>
                          </div>
                       )}
                    </div>
                 </div>
              )}

              <button
                 onClick={handlePublish}
                 disabled={isSaving || !content || selectedPlatforms.length === 0 || validationErrors.length > 0}
                 className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
              >
                 {isSaving ? <RotateCcw className="w-5 h-5 animate-spin" /> : (scheduleMode === 'now' ? <Send className="w-5 h-5" /> : <CalendarIcon className="w-5 h-5" />)}
                 {scheduleMode === 'now' ? 'Publish Immediately' : 'Schedule Post'}
              </button>
           </div>
        </div>

        {/* RIGHT COLUMN: Live Preview */}
        <div className="w-full xl:w-[420px] flex flex-col gap-4">
           
           <div className="bg-[#1d1d1f] rounded-[32px] p-2 pb-0 shadow-2xl border border-gray-800 flex flex-col h-[700px] sticky top-6 overflow-hidden">
              {/* Phone Status Bar Mock */}
              <div className="h-10 flex justify-between items-center px-6 pt-2 shrink-0">
                 <span className="text-white text-xs font-medium">9:41</span>
                 <div className="flex gap-1.5">
                    <div className="w-4 h-2.5 bg-white rounded-[1px]"></div>
                    <div className="w-0.5 h-2.5 bg-white/30 rounded-[1px]"></div>
                 </div>
              </div>

              {/* Platform Switcher Tabs */}
              {selectedPlatforms.length > 0 ? (
                 <div className="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar shrink-0">
                    {selectedPlatforms.map(p => (
                       <button
                          key={p}
                          onClick={() => setPreviewPlatform(p)}
                          className={`
                             flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all
                             ${previewPlatform === p ? 'bg-white/20 text-white backdrop-blur-md' : 'bg-white/5 text-gray-400 hover:bg-white/10'}
                          `}
                       >
                          <PlatformIcon platform={p} size={12} white={true} />
                          {p}
                       </button>
                    ))}
                 </div>
              ) : (
                <div className="px-6 py-2 text-gray-500 text-xs font-medium text-center">Select a platform to preview</div>
              )}

              {/* Content Preview Area */}
              <div className="flex-1 bg-white rounded-t-[24px] mt-2 overflow-hidden relative">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 z-10">
                    <div className="w-1/3 h-full bg-blue-500"></div>
                 </div>
                 
                 <div className="h-full overflow-y-auto custom-scrollbar p-0 bg-gray-50">
                    {renderPreviewContent()}
                 </div>
                 
                 {/* Live Warning Overlay */}
                 {validationErrors.length > 0 && (
                    <div className="absolute bottom-4 left-4 right-4 bg-red-500/90 backdrop-blur-md text-white p-3 rounded-xl shadow-lg animate-in slide-in-from-bottom-2 z-50">
                       <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <div className="text-xs font-medium">
                             <p className="font-bold mb-1">Issues Detected:</p>
                             <ul className="list-disc list-inside opacity-90">
                                {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
                             </ul>
                          </div>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
      
      <MediaPicker isOpen={isMediaPickerOpen} onClose={() => setIsMediaPickerOpen(false)} onSelect={setSelectedMedia} />
    </div>
  );
};