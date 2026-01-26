
// ... existing imports ...
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Calendar as CalendarIcon, RotateCcw, Image as ImageIcon, ChevronDown, CheckCircle, Briefcase, Smile, Rocket, GraduationCap, X, FileVideo, Clock, Save, AlertCircle, Check, Zap, Eye, Copy, Hash, MoreHorizontal, ThumbsUp, MessageSquare, Share2, Repeat, Bookmark, Globe, Heart, Layers, UploadCloud, RefreshCw, ShieldCheck, AlertTriangle, Bot, Info, Cloud, CheckSquare, Plus, Split, ExternalLink, MapPin, Wand2 } from 'lucide-react';
import { generatePostContent, generatePostVariants, generateHashtags, validateContentSafety, refinePostContent } from '../services/geminiService';
import { validatePost } from '../services/validationService';
import { store } from '../services/mockStore';
import { Platform, PostStatus, MediaItem, Post, PageProps, BotType, PostVariant, BotConfig } from '../types';
import { PlatformIcon } from '../components/PlatformIcon';
import { MediaPicker } from '../components/MediaPicker';
import { usePlatforms } from '../hooks/usePlatforms';
import { CreativeGenerator } from '../components/CreativeGenerator';

// ... Constants TONES, EMOJI_CATEGORIES ...
const TONES = ['Professional', 'Funny', 'Viral', 'Educational', 'Empathetic', 'Controversial'];
const EMOJI_CATEGORIES = { 'Popular': ['🚀', '🔥', '✨', '💡', '📈', '💪', '🎯', '🤖', '👀', '✅', '⚠️', '🎉'], 'Faces': ['😀', '😂', '😎', '🤔', '🤯', '😍', '🥳', '🥶', '🤡', '🤠', '🤐', '🫠'], 'Objects': ['📱', '💻', '📷', '🎥', '🎙️', '⌚', '🔋', '🔌', '🧰', '🔭', '📡', '💾'], 'Symbols': ['🔴', '🟢', '🔵', '💯', '💢', '💫', '💥', '💦', '💤', '💭', '📣', '🔔'] };

export const CreatorStudio: React.FC<PageProps> = ({ onNavigate, params }) => {
  const { platforms, getActivePlatforms } = usePlatforms();
  const availablePlatforms = getActivePlatforms();

  // ... (State definitions) ...
  const [originalPost, setOriginalPost] = useState<Post | null>(null);
  const [postTimezone, setPostTimezone] = useState<string | undefined>(undefined);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'modified'>('synced');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPlatform, setGenerationPlatform] = useState<Platform>(Platform.Twitter);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [variants, setVariants] = useState<PostVariant[]>([{ id: 'v1', name: 'Variant A', content: '' }]);
  const [activeVariantId, setActiveVariantId] = useState<string>('v1');
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [youtubeTitle, setYoutubeTitle] = useState(''); 
  const [youtubeThumbnail, setYoutubeThumbnail] = useState<MediaItem | null>(null);
  const [isCarousel, setIsCarousel] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([Platform.Twitter]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [postAuthor, setPostAuthor] = useState<'User' | BotType>('User'); 
  const [postStatus, setPostStatus] = useState<PostStatus>(PostStatus.Draft); 
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showHashtags, setShowHashtags] = useState(false);
  const [currentEmojiCategory, setCurrentEmojiCategory] = useState('Popular');
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [timeState, setTimeState] = useState({ hour: '09', minute: '00', period: 'AM' });
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [autoEngage, setAutoEngage] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [bypassSafety, setBypassSafety] = useState(false); 
  const [bots, setBots] = useState<BotConfig[]>([]);
  const [previewPlatform, setPreviewPlatform] = useState<Platform>(Platform.Twitter);
  
  // Media States
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isCreativeGenOpen, setIsCreativeGenOpen] = useState(false); 
  const [mediaPickerMode, setMediaPickerMode] = useState<'main' | 'thumbnail'>('main');
  
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingSafety, setIsCheckingSafety] = useState(false);
  const [safetyIssues, setSafetyIssues] = useState<string[]>([]);
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  // ... (Effects same as before) ...
  useEffect(() => { store.getBots().then(setBots); }, []);
  useEffect(() => {
      // Hydration logic same as previous ...
      if (params && params.postId) {
        store.getPosts().then(async (posts) => {
          const post = posts.find(p => p.id === params.postId);
          if (post) {
            setOriginalPost(post);
            setCurrentPostId(post.id);
            setSelectedPlatforms(post.platforms);
            setYoutubeTitle(post.title || '');
            setIsCarousel(post.isCarousel || false);
            setIsAiGenerated(post.generatedByAi);
            setPostAuthor(post.author || 'User');
            setPostStatus(post.status);
            if (post.variants && post.variants.length > 0) {
                setVariants(post.variants);
                const activeId = post.activeVariantId || post.variants[0].id;
                const activeVariant = post.variants.find(v => v.id === activeId) || post.variants[0];
                setActiveVariantId(activeId);
                setContent(activeVariant.content);
            } else {
                setContent(post.content);
                setVariants([{ id: 'v1', name: 'Original', content: post.content }]);
                setActiveVariantId('v1');
            }
            setAutoEngage(!!post.autoOps?.autoEngage);
            setBypassSafety(!!post.safetySettings?.bypassSafety);
            setPostTimezone(post.timezone);
            if (post.creationContext?.topic) setTopic(post.creationContext.topic);
            const library = await store.getMedia();
            if (post.mediaUrl) {
                const found = (post.mediaId ? library.find(m => m.id === post.mediaId) : null) || library.find(m => m.url === post.mediaUrl);
                if (found) setSelectedMedia(found);
            }
            if (post.scheduledFor) {
               const date = new Date(post.scheduledFor);
               setScheduleMode('later');
               setScheduledDate(date);
               let h = date.getHours();
               const p = h >= 12 ? 'PM' : 'AM';
               h = h % 12;
               h = h ? h : 12;
               setTimeState({ hour: h.toString().padStart(2, '0'), minute: date.getMinutes().toString().padStart(2, '0'), period: p });
            }
            setSyncStatus('synced');
          }
        });
      }
  }, [params]);

  useEffect(() => {
    if (selectedPlatforms.length > 0 && !selectedPlatforms.includes(previewPlatform)) {
      setPreviewPlatform(selectedPlatforms[0]);
    }
  }, [selectedPlatforms]);

  // Validation Logic Updated to use Registry
  useEffect(() => {
    let checkDate: Date | undefined = undefined;
    if (scheduleMode === 'later') {
      checkDate = new Date(scheduledDate);
      let hours = parseInt(timeState.hour);
      if (timeState.period === 'PM' && hours !== 12) hours += 12;
      else if (timeState.period === 'AM' && hours === 12) hours = 0;
      checkDate.setHours(hours, parseInt(timeState.minute), 0, 0);
    }

    const { errors, warnings } = validatePost(
        content, 
        selectedPlatforms, 
        platforms, // Pass Registry
        selectedMedia, 
        isCarousel, 
        youtubeTitle, 
        checkDate
    );
    
    // Additional Bot Warnings
    const botWarnings: string[] = [];
    if (autoEngage) {
        const engagementBot = bots.find(b => b.type === BotType.Engagement);
        if (engagementBot) {
            const usage = engagementBot.stats.currentDailyActions / engagementBot.stats.maxDailyActions;
            if (usage >= 0.9) botWarnings.push("Engagement Bot daily limit nearly reached (>90%).");
        }
    }

    // Platform Compatibility Warnings
    if (selectedMedia && selectedMedia.platformCompatibility) {
        selectedPlatforms.forEach(p => {
            const status = selectedMedia.platformCompatibility?.[p];
            const hasVariant = selectedMedia.variants?.some(v => v.platform === p || v.enhancementType);
            if (status && !status.compatible && !hasVariant) {
                botWarnings.push(`${p}: Incompatible media - ${status.issues?.join(', ')}`);
            }
        });
    }

    setValidationErrors(errors);
    setValidationWarnings([...warnings, ...botWarnings]);
  }, [content, selectedPlatforms, youtubeTitle, selectedMedia, isCarousel, scheduledDate, timeState, scheduleMode, autoEngage, bots, platforms]);

  // ... (Handlers same as before) ...
  // getCommonContext, handleGenerate, handleSmartOptimize, handleGenerateVariants...
  // handleSwitchVariant, handleAddVariant, handleDeleteVariant, handleFetchHashtags, handleInsertText...
  // handleMediaPickerOpen, handleMediaSelect...
  const handleGenerate = async () => { /* ... */ }; 
  const handleSmartOptimize = async () => { /* ... */ };
  const handleGenerateVariants = async () => { /* ... */ };
  const handleSwitchVariant = (id: string) => { 
      setVariants(prev => prev.map(v => v.id === activeVariantId ? { ...v, content: content } : v));
      const nextVariant = variants.find(v => v.id === id);
      if (nextVariant) { setActiveVariantId(id); setContent(nextVariant.content); }
  };
  const handleAddVariant = () => { /* ... */ };
  const handleDeleteVariant = (e: any, id: string) => { /* ... */ };
  const handleFetchHashtags = async () => { /* ... */ };
  const handleInsertText = (text: string) => { setContent(prev => prev + ' ' + text); };
  
  const handleMediaPickerOpen = (mode: 'main' | 'thumbnail') => {
    setMediaPickerMode(mode);
    setIsMediaPickerOpen(true);
  };

  const handleMediaSelect = (item: MediaItem) => {
    if (mediaPickerMode === 'main') setSelectedMedia(item);
    else { if (item.type !== 'image') { alert("Thumbnails must be images."); return; } setYoutubeThumbnail(item); }
    setSyncStatus('modified');
  };

  const handleCreativeSuccess = (item: MediaItem) => {
      handleMediaSelect(item);
  };

  // ... (Render logic same) ...
  const renderPreviewContent = () => { return <div>Preview</div> }; 

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500 pb-10 relative">
      {/* ... Header and Content ... */}
      <div className="flex flex-col xl:flex-row gap-8 h-full">
        <div className="flex-1 flex flex-col gap-6 min-w-0">
           {/* ... AI Assistant ... */}
           
           <div className="bg-white rounded-[32px] p-6 shadow-sm border border-black/5 flex-1 flex flex-col gap-6">
              {/* Platform Selector */}
              <div>
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Target Platforms</label>
                 <div className="flex flex-wrap gap-2">
                    {availablePlatforms.map(p => {
                       const isSelected = selectedPlatforms.includes(p.id);
                       return (
                          <button
                             key={p.id}
                             onClick={() => {
                                const newSelection = isSelected 
                                   ? selectedPlatforms.filter(i => i !== p.id) 
                                   : [...selectedPlatforms, p.id];
                                setSelectedPlatforms(newSelection);
                                if (!isSelected) setPreviewPlatform(p.id);
                             }}
                             className={`
                                flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-200 text-xs font-bold
                                ${isSelected 
                                   ? 'bg-black text-white border-black shadow-md' 
                                   : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                             `}
                          >
                             <PlatformIcon platform={p.id} size={14} white={isSelected} />
                             {p.name}
                          </button>
                       );
                    })}
                 </div>
              </div>
              
              {/* ... Toolbar and Editor ... */}
              <div className="relative flex-1">
                  <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full h-full p-4 bg-gray-50 rounded-xl" />
                  
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center bg-white/80 backdrop-blur-sm p-1 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex gap-1">
                            <button onClick={() => handleMediaPickerOpen('main')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors" title="Library">
                                <ImageIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => setIsCreativeGenOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-2 px-3 bg-purple-50/50" title="Generate AI Media">
                                <Sparkles className="w-4 h-4" /> 
                                <span className="text-xs font-bold">Generate</span>
                            </button>
                        </div>
                  </div>
              </div>
           </div>
        </div>
        {/* ... Preview Column ... */}
      </div>

      <MediaPicker isOpen={isMediaPickerOpen} onClose={() => setIsMediaPickerOpen(false)} onSelect={handleMediaSelect} />
      <CreativeGenerator isOpen={isCreativeGenOpen} onClose={() => setIsCreativeGenOpen(false)} onSuccess={handleCreativeSuccess} context="Creator Studio" />
    </div>
  );
};
