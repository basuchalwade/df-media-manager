
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Calendar as CalendarIcon, RotateCcw, Image as ImageIcon, ChevronDown, CheckCircle, Briefcase, Smile, Rocket, GraduationCap, X, FileVideo, Clock, Save, AlertCircle, Check, Zap, Eye, Copy, Hash, MoreHorizontal, ThumbsUp, MessageSquare, Share2, Repeat, Bookmark, Globe, Heart, Layers, UploadCloud, RefreshCw, ShieldCheck, AlertTriangle, Bot, Info, Cloud, CheckSquare, Plus, Split } from 'lucide-react';
import { generatePostContent, generatePostVariants, generateHashtags, validateContentSafety } from '../services/geminiService';
import { validatePost, PLATFORM_LIMITS } from '../services/validationService';
import { store } from '../services/mockStore';
import { Platform, PostStatus, MediaItem, Post, PageProps, BotType, PostVariant } from '../types';
import { PlatformIcon } from '../components/PlatformIcon';
import { MediaPicker } from '../components/MediaPicker';

const TONES = ['Professional', 'Funny', 'Viral', 'Educational', 'Empathetic', 'Controversial'];

const EMOJI_CATEGORIES = {
  'Popular': ['🚀', '🔥', '✨', '💡', '📈', '💪', '🎯', '🤖', '👀', '✅', '⚠️', '🎉'],
  'Faces': ['😀', '😂', '😎', '🤔', '🤯', '😍', '🥳', '🥶', '🤡', '🤠', '🤐', '🫠'],
  'Objects': ['📱', '💻', '📷', '🎥', '🎙️', '⌚', '🔋', '🔌', '🧰', '🔭', '📡', '💾'],
  'Symbols': ['🔴', '🟢', '🔵', '💯', '💢', '💫', '💥', '💦', '💤', '💭', '📣', '🔔']
};

export const CreatorStudio: React.FC<PageProps> = ({ onNavigate, params }) => {
  // --- Deep Sync State ---
  const [originalPost, setOriginalPost] = useState<Post | null>(null);
  const [postTimezone, setPostTimezone] = useState<string | undefined>(undefined);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'modified'>('synced');

  // --- AI State ---
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPlatform, setGenerationPlatform] = useState<Platform>(Platform.Twitter);

  // --- Variant State (A/B Testing) ---
  const [variants, setVariants] = useState<PostVariant[]>([{ id: 'v1', name: 'Variant A', content: '' }]);
  const [activeVariantId, setActiveVariantId] = useState<string>('v1');

  // --- Composer State ---
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [youtubeTitle, setYoutubeTitle] = useState(''); 
  const [youtubeThumbnail, setYoutubeThumbnail] = useState<MediaItem | null>(null);
  const [isCarousel, setIsCarousel] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([Platform.Twitter]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [postAuthor, setPostAuthor] = useState<'User' | BotType>('User'); // Track if this is bot content
  const [postStatus, setPostStatus] = useState<PostStatus>(PostStatus.Draft); // Track status locally
  
  // --- Tools State ---
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showHashtags, setShowHashtags] = useState(false);
  const [currentEmojiCategory, setCurrentEmojiCategory] = useState('Popular');
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(false);
  
  // --- Scheduling State ---
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [timeState, setTimeState] = useState({ hour: '09', minute: '00', period: 'AM' });
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // --- Automation State ---
  const [autoEngage, setAutoEngage] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [bypassSafety, setBypassSafety] = useState(false); // Deep Sync: Safety Override

  // --- UI State ---
  const [previewPlatform, setPreviewPlatform] = useState<Platform>(Platform.Twitter);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerMode, setMediaPickerMode] = useState<'main' | 'thumbnail'>('main');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // --- Safety Check State ---
  const [isCheckingSafety, setIsCheckingSafety] = useState(false);
  const [safetyIssues, setSafetyIssues] = useState<string[]>([]);
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  // Initialize from Navigation Params
  useEffect(() => {
    if (params) {
      if (params.postId) {
        // Edit Mode
        store.getPosts().then(posts => {
          const post = posts.find(p => p.id === params.postId);
          if (post) {
            setOriginalPost(post); // DEEP SYNC: Store original to preserve metadata
            
            setCurrentPostId(post.id);
            setSelectedPlatforms(post.platforms);
            setYoutubeTitle(post.title || '');
            setIsCarousel(post.isCarousel || false);
            setIsAiGenerated(post.generatedByAi);
            setPostAuthor(post.author || 'User');
            setPostStatus(post.status); // Hydrate Status
            
            // Variants Logic
            if (post.variants && post.variants.length > 0) {
                setVariants(post.variants);
                // If active variant specified, load it. Else default to first.
                const activeId = post.activeVariantId || post.variants[0].id;
                const activeVariant = post.variants.find(v => v.id === activeId) || post.variants[0];
                setActiveVariantId(activeId);
                setContent(activeVariant.content);
                // Note: Currently media isn't strictly per-variant in UI state, but model supports it.
                // We'll load the top-level media which represents active variant.
            } else {
                // Fallback for legacy posts
                setContent(post.content);
                setVariants([{ id: 'v1', name: 'Original', content: post.content }]);
                setActiveVariantId('v1');
            }
            
            // Deep Sync: Auto-Ops & Safety
            setAutoEngage(!!post.autoOps?.autoEngage);
            setBypassSafety(!!post.safetySettings?.bypassSafety);
            setPostTimezone(post.timezone);

            // Restore Creation Context if available
            if (post.creationContext?.topic) {
                setTopic(post.creationContext.topic);
            }
            
            // Media
            if (post.mediaUrl) {
               setSelectedMedia({ 
                 id: 'loaded-media', 
                 name: 'Current Media', 
                 type: post.mediaType || 'image', 
                 url: post.mediaUrl, 
                 size: 0, 
                 createdAt: '' 
               });
            } else {
               setSelectedMedia(null);
            }
            if (post.thumbnailUrl) {
               setYoutubeThumbnail({
                  id: 'loaded-thumb', name: 'Thumbnail', type: 'image', url: post.thumbnailUrl, size: 0, createdAt: ''
               });
            }

            // Schedule
            if (post.scheduledFor) {
               const date = new Date(post.scheduledFor);
               if (date > new Date()) {
                  setScheduleMode('later');
                  setScheduledDate(date);
                  let h = date.getHours();
                  const p = h >= 12 ? 'PM' : 'AM';
                  h = h % 12;
                  h = h ? h : 12;
                  setTimeState({ hour: h.toString().padStart(2, '0'), minute: date.getMinutes().toString().padStart(2, '0'), period: p });
               }
            }
            
            setSyncStatus('synced'); // Initially synced
          }
        });
      } else if (params.date) {
        // Create Mode with Date
        setScheduleMode('later');
        setScheduledDate(new Date(params.date));
        resetForm(false); // Reset but keep date
        
        // Deep Sync: Initialize from Calendar Context
        if (params.timezone) setPostTimezone(params.timezone);
        if (params.platform) {
            setSelectedPlatforms([params.platform]);
            setPreviewPlatform(params.platform);
        }
        setSyncStatus('synced');
      }
    } else {
      resetForm(true);
      setSyncStatus('synced');
    }
  }, [params]);

  // Sync preview platform
  useEffect(() => {
    if (selectedPlatforms.length > 0 && !selectedPlatforms.includes(previewPlatform)) {
      setPreviewPlatform(selectedPlatforms[0]);
    }
  }, [selectedPlatforms]);

  // Validation Logic (Shared)
  useEffect(() => {
    const errors = validatePost(content, selectedPlatforms, selectedMedia, isCarousel, youtubeTitle);
    setValidationErrors(errors);
  }, [content, selectedPlatforms, youtubeTitle, selectedMedia, isCarousel]);

  // Change Detection for Sync Status
  useEffect(() => {
    if (!originalPost && !content) return; // Fresh state

    const isModified = 
        content !== (originalPost?.content || '') ||
        selectedPlatforms.length !== (originalPost?.platforms?.length || 1) ||
        youtubeTitle !== (originalPost?.title || '') ||
        (scheduleMode === 'later' && originalPost?.scheduledFor && Math.abs(new Date(originalPost.scheduledFor).getTime() - scheduledDate.getTime()) > 60000);

    if (isModified) {
        setSyncStatus('modified');
    }
  }, [content, selectedPlatforms, youtubeTitle, scheduledDate, timeState, originalPost]);

  // Initial Hashtags
  useEffect(() => {
    setSuggestedHashtags(['#Trend', '#New', '#Update', '#Growth', '#Tech']);
  }, []);

  // --- Handlers ---

  const getCommonContext = () => {
    let timeContext = "Immediate Publication (Right Now)";
    if (scheduleMode === 'later') {
        const day = scheduledDate.toLocaleDateString('en-US', { weekday: 'long' });
        const date = scheduledDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        timeContext = `${day}, ${date} at ${timeState.hour}:${timeState.minute} ${timeState.period}`;
        if (postTimezone) timeContext += ` (${postTimezone})`;
    }

    const contextPlatform = selectedPlatforms.length > 0 ? selectedPlatforms[0] : generationPlatform;
    const charLimit = PLATFORM_LIMITS[contextPlatform];
    let constraints = `Strictly keep under ${charLimit} characters.`;
    if (contextPlatform === Platform.LinkedIn) constraints += " Use professional spacing, bullet points, and a 'hook' in the first line.";
    if (contextPlatform === Platform.Twitter) constraints += " Use thread-style brevity if needed, focus on impact. No intro fluff.";
    if (contextPlatform === Platform.Instagram) constraints += " Write an engaging caption. Assume visuals are attached.";
    if (contextPlatform === Platform.YouTube) constraints += " Write a compelling video description with a clear CTA.";

    return {
        contextPlatform,
        timeContext,
        constraints
    };
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    
    const { contextPlatform, timeContext, constraints } = getCommonContext();

    // 3. Generate
    const generated = await generatePostContent(topic, contextPlatform, tone, {
        scheduledTime: timeContext,
        platformConstraints: constraints,
        brandVoice: tone, // Mapping tone to voice
        safetyLevel: bypassSafety ? "Relaxed (User Override)" : "Strict Brand Safety",
    });

    setContent(generated);
    // Update current variant content
    setVariants(prev => prev.map(v => v.id === activeVariantId ? { ...v, content: generated } : v));

    if(contextPlatform === Platform.YouTube) setYoutubeTitle(`${topic} - Official Video`);
    setIsAiGenerated(true);
    setIsGenerating(false);
    setSyncStatus('modified');
    setPostAuthor(BotType.Creator); // Explicitly mark as bot content
    setPostStatus(PostStatus.NeedsReview); // Bot content needs review
  };

  const handleGenerateVariants = async () => {
    if (!topic) return;
    setIsGenerating(true);
    
    const { contextPlatform, timeContext, constraints } = getCommonContext();

    // Generate 3 variations
    const newVariants = await generatePostVariants(topic, contextPlatform, tone, {
        scheduledTime: timeContext,
        platformConstraints: constraints,
        brandVoice: tone, 
        safetyLevel: bypassSafety ? "Relaxed" : "Strict",
    });

    // Map to PostVariant structure
    const formattedVariants: PostVariant[] = newVariants.map((v, i) => ({
        id: `gen-${Date.now()}-${i}`,
        name: v.name,
        content: v.content,
        mediaUrl: selectedMedia?.url, // Carry over current media
        mediaType: selectedMedia?.type
    }));

    if (formattedVariants.length > 0) {
        setVariants(formattedVariants);
        setActiveVariantId(formattedVariants[0].id);
        setContent(formattedVariants[0].content);
        setPostAuthor(BotType.Creator);
        setPostStatus(PostStatus.NeedsReview);
        setSyncStatus('modified');
    }

    setIsGenerating(false);
  };

  // Switch Variant Logic
  const handleSwitchVariant = (id: string) => {
    // 1. Save current state to the active variant before switching
    setVariants(prev => prev.map(v => 
        v.id === activeVariantId 
        ? { ...v, content: content } // Update content of outgoing variant
        : v
    ));

    // 2. Load new variant
    const nextVariant = variants.find(v => v.id === id);
    if (nextVariant) {
        setActiveVariantId(id);
        setContent(nextVariant.content || '');
        // Media switching per variant can be added here if supported in UI
    }
  };

  const handleAddVariant = () => {
      const newId = `v-${Date.now()}`;
      const newVariant: PostVariant = {
          id: newId,
          name: `Variant ${String.fromCharCode(65 + variants.length)}`, // Variant A, B, C...
          content: content // Clone current content as start
      };
      setVariants([...variants, newVariant]);
      handleSwitchVariant(newId);
  };

  const handleDeleteVariant = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (variants.length === 1) return; // Prevent deleting last
      
      const newVariants = variants.filter(v => v.id !== id);
      setVariants(newVariants);
      
      if (activeVariantId === id) {
          // Switch to first available
          setActiveVariantId(newVariants[0].id);
          setContent(newVariants[0].content);
      }
      setSyncStatus('modified');
  };

  const handleFetchHashtags = async () => {
    setIsTagsLoading(true);
    const tags = await generateHashtags(topic || "Technology", content);
    setSuggestedHashtags(tags);
    setIsTagsLoading(false);
  };

  const handleInsertText = (text: string) => {
    setContent(prev => prev + (prev.length > 0 ? ' ' : '') + text);
  };

  const handleMediaPickerOpen = (mode: 'main' | 'thumbnail') => {
    setMediaPickerMode(mode);
    setIsMediaPickerOpen(true);
  };

  const handleMediaSelect = (item: MediaItem) => {
    if (mediaPickerMode === 'main') {
      setSelectedMedia(item);
    } else {
      if (item.type !== 'image') {
        alert("Thumbnails must be images.");
        return;
      }
      setYoutubeThumbnail(item);
    }
    setSyncStatus('modified');
  };

  // DEEP SYNC: Merges original post data with new form changes to prevent data loss
  const constructPostObject = (targetStatus: PostStatus, forceNewId: boolean = false): Post => {
    let finalDate = new Date();
    if (scheduleMode === 'later') {
      finalDate = new Date(scheduledDate);
      let hours = parseInt(timeState.hour);
      if (timeState.period === 'PM' && hours !== 12) hours += 12;
      else if (timeState.period === 'AM' && hours === 12) hours = 0;
      finalDate.setHours(hours, parseInt(timeState.minute), 0, 0);
    }

    const id = (currentPostId && !forceNewId) ? currentPostId : Date.now().toString() + Math.random().toString(36).substr(2, 5);

    // If duplicating, we don't merge original stats. If updating, we merge.
    const basePost = (!forceNewId && originalPost) ? originalPost : {};

    // Ensure variants are up to date with current editor state
    const updatedVariants = variants.map(v => 
        v.id === activeVariantId ? { ...v, content: content } : v
    );

    const newPost: Post = {
      ...basePost, // DEEP SYNC: Spread original first
      id: id,
      title: youtubeTitle,
      description: content, 
      thumbnailUrl: youtubeThumbnail?.url,
      isCarousel,
      content: content,
      platforms: selectedPlatforms,
      scheduledFor: finalDate.toISOString(),
      status: targetStatus,
      generatedByAi: isAiGenerated,
      mediaUrl: selectedMedia?.url,
      mediaType: selectedMedia?.type,
      author: forceNewId ? 'User' : postAuthor,
      // Variants Sync
      variants: updatedVariants,
      activeVariantId: activeVariantId,
      // Deep Sync: Settings
      timezone: postTimezone,
      autoOps: { autoEngage },
      safetySettings: { bypassSafety, lastChecked: new Date().toISOString() },
      // If original had engagement, keep it. If new/duplicate, init to 0.
      engagement: (!forceNewId && originalPost?.engagement) ? originalPost.engagement : { likes: 0, shares: 0, comments: 0 }
    };

    // Add creation context if new
    if (!originalPost && !newPost.creationContext) {
        newPost.creationContext = {
            source: isAiGenerated ? 'AI_Assistant' : 'Manual',
            topic: topic || undefined,
        };
    }

    return newPost;
  };

  const performSafetyCheck = async (): Promise<boolean> => {
    setIsCheckingSafety(true);
    const result = await validateContentSafety(content, selectedPlatforms);
    setIsCheckingSafety(false);
    
    if (!result.safe) {
      setSafetyIssues(result.issues);
      setShowSafetyModal(true);
      return false;
    }
    return true;
  };

  const handlePublish = async (skipSafety: boolean = false) => {
    if (validationErrors.length > 0 || !content) return;
    
    if (!skipSafety && !bypassSafety) {
      const isSafe = await performSafetyCheck();
      if (!isSafe) return; // Modal will show
    }

    if (skipSafety) {
        setBypassSafety(true);
    }

    setIsSaving(true);
    const status = scheduleMode === 'now' ? PostStatus.Published : PostStatus.Scheduled;
    const newPost = constructPostObject(status);
    
    if (currentPostId) {
      await store.updatePost(newPost);
    } else {
      await store.addPost(newPost);
    }
    
    alert(scheduleMode === 'now' ? 'Published successfully!' : 'Scheduled successfully!');
    setIsSaving(false);
    setShowSafetyModal(false);
    
    setOriginalPost(newPost); // Update local reference
    setPostStatus(status);
    setSyncStatus('synced'); // Update Status
    
    // Optional: Navigate back to calendar if that's where we came from?
    if (!currentPostId) resetForm(true);
  };

  const handleSaveDraft = async () => {
    if (!content) return;
    setIsSaving(true);
    
    // Preserve current status if it's already a draft type, otherwise revert to Draft
    const targetStatus = (postStatus === PostStatus.NeedsReview) ? PostStatus.NeedsReview : PostStatus.Draft;
    const newPost = constructPostObject(targetStatus);
    
    if (currentPostId) {
       await store.updatePost(newPost);
       setOriginalPost(newPost);
       setPostStatus(targetStatus);
       
       const btn = document.getElementById('save-draft-btn');
       if(btn) {
         const originalText = btn.innerText;
         btn.innerText = 'Saved!';
         setTimeout(() => btn.innerText = originalText, 2000);
       }
    } else {
       const saved = await store.addPost(newPost);
       setCurrentPostId(saved.id);
       setOriginalPost(saved);
       setPostStatus(targetStatus);
       alert('Draft saved. You can continue editing.');
    }
    
    setSyncStatus('synced'); // Update Status
    setIsSaving(false);
  };

  const handleReviewApprove = () => {
      // Transition from Needs Review -> Draft (Human ownership) or Approved
      setPostAuthor('User');
      setPostStatus(PostStatus.Approved);
      setSyncStatus('modified'); // Mark as modified so user saves
  };

  const handleDuplicate = async () => {
    if (!content) return;
    setIsSaving(true);
    const newPost = constructPostObject(PostStatus.Draft, true);
    if (newPost.title) newPost.title = `${newPost.title} (Copy)`;
    
    const saved = await store.addPost(newPost);
    setCurrentPostId(saved.id);
    setPostAuthor('User'); 
    setPostStatus(PostStatus.Draft);
    setOriginalPost(saved); 
    setBypassSafety(false); 
    setSyncStatus('synced');
    
    alert("Version duplicated! You are now editing the copy.");
    setIsSaving(false);
  };

  const resetForm = (clearDate: boolean = true) => {
    setOriginalPost(null);
    setContent('');
    setYoutubeTitle('');
    setYoutubeThumbnail(null);
    setIsCarousel(false);
    setTopic('');
    setSelectedMedia(null);
    setIsAiGenerated(false);
    setSelectedPlatforms([Platform.Twitter]);
    setValidationErrors([]);
    setScheduleMode(clearDate ? 'now' : 'later');
    if (clearDate) setScheduledDate(new Date());
    setCurrentPostId(null);
    setSafetyIssues([]);
    setPostAuthor('User');
    setPostStatus(PostStatus.Draft);
    setBypassSafety(false);
    setAutoEngage(false);
    setPostTimezone(undefined);
    setSyncStatus('synced');
    setVariants([{ id: 'v1', name: 'Variant A', content: '' }]);
    setActiveVariantId('v1');
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

  // Render Logic
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
            
            <div className="aspect-square bg-gray-100 relative">
               {selectedMedia ? (
                 selectedMedia.type === 'image' ? <img src={selectedMedia.url} className="w-full h-full object-cover" /> : <video src={selectedMedia.url} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">No Media</div>
               )}
               {isCarousel && (
                  <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5">
                     <Layers className="w-4 h-4 text-white" />
                  </div>
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
             <div className="aspect-video bg-black w-full flex items-center justify-center relative">
                {selectedMedia ? (
                   selectedMedia.type === 'image' ? <img src={selectedMedia.url} className="w-full h-full object-cover opacity-80" /> : <video src={selectedMedia.url} className="w-full h-full object-cover" />
                ) : (
                   <div className="text-gray-500">Video Player</div>
                )}
                
                {/* Thumbnail Preview Overlay */}
                {youtubeThumbnail && (
                   <div className="absolute bottom-2 right-2 w-24 aspect-video bg-black border border-white rounded shadow-lg overflow-hidden z-20">
                      <img src={youtubeThumbnail.url} className="w-full h-full object-cover" alt="Thumb" />
                   </div>
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
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500 pb-10 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
           <h1 className="text-[34px] font-bold text-[#1d1d1f] tracking-tight">Creator Studio</h1>
           <div className="flex items-center gap-3 mt-1">
              <p className="text-gray-500 font-medium">Draft, optimize, and schedule your content across channels.</p>
              {/* Sync Status Indicator */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                syncStatus === 'synced' ? 'bg-green-50 text-green-700 border-green-200' :
                'bg-yellow-50 text-yellow-700 border-yellow-200 shadow-sm'
              }`}>
                {syncStatus === 'synced' ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />}
                <span>{syncStatus === 'synced' ? 'In Sync' : 'Unsaved Changes'}</span>
              </div>
              
              {/* Lifecycle Badge */}
              {postStatus !== PostStatus.Draft && (
                  <div className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wide border border-gray-200">
                      {postStatus}
                  </div>
              )}
           </div>
         </div>
         <div className="flex gap-2">
            <button 
               onClick={handleDuplicate}
               className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-full shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
               title="Create a copy (A/B Test)"
            >
               <Copy className="w-4 h-4" /> Duplicate
            </button>
            <button 
               id="save-draft-btn"
               onClick={handleSaveDraft}
               className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-full shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
               <Save className="w-4 h-4" /> Save Draft
            </button>
         </div>
      </div>
      
      {/* Creation Context / Intent Display */}
      {originalPost?.creationContext && (
         <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg w-fit">
            <Info className="w-3.5 h-3.5" />
            <span>
                Original Intent: {originalPost.creationContext.source.replace('_', ' ')} 
                {originalPost.creationContext.topic ? ` — Topic: "${originalPost.creationContext.topic}"` : ''}
            </span>
         </div>
      )}

      {/* Bot Review Mode Banner */}
      {postStatus === PostStatus.NeedsReview && (
         <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-4 animate-in slide-in-from-top-2 shadow-sm">
             <div className="bg-amber-100 p-2 rounded-xl text-amber-700">
                <Bot className="w-6 h-6" />
             </div>
             <div className="flex-1">
                <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide">AI Content Review</h3>
                <p className="text-sm text-amber-800 mt-1">
                   This content was generated by <strong>{postAuthor}</strong>. 
                   Review and approve it to enable scheduling.
                </p>
                {bypassSafety && (
                    <div className="mt-2 text-xs text-red-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Safety checks have been bypassed for this post.
                    </div>
                )}
             </div>
             <div className="flex gap-2">
                <button 
                   onClick={handleReviewApprove} 
                   className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 shadow-md"
                >
                   <CheckSquare className="w-4 h-4" /> Approve & Edit
                </button>
             </div>
         </div>
      )}

      <div className="flex flex-col xl:flex-row gap-8 h-full">
        {/* Same Layout as before, just state wired up */}
        
        {/* LEFT COLUMN: Editor & Configuration */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
           
           {/* AI Assistant */}
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
                 <div className="flex gap-2">
                    <button 
                      onClick={handleGenerate}
                      disabled={isGenerating || !topic}
                      className="flex-1 py-3 bg-black text-white rounded-xl font-bold text-sm shadow-lg shadow-black/10 hover:bg-gray-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isGenerating ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-yellow-300" />}
                        {isGenerating ? 'Drafting...' : 'Generate Draft'}
                    </button>
                    <button 
                      onClick={handleGenerateVariants}
                      disabled={isGenerating || !topic}
                      className="px-6 py-3 bg-purple-100 text-purple-700 rounded-xl font-bold text-sm hover:bg-purple-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      title="Create 3 unique variations"
                    >
                        <Split className="w-4 h-4" /> Variants
                    </button>
                 </div>
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
                             onClick={() => {
                                const newSelection = isSelected 
                                   ? selectedPlatforms.filter(i => i !== p) 
                                   : [...selectedPlatforms, p];
                                setSelectedPlatforms(newSelection);
                                // Trigger modified state logic handled by useEffect
                             }}
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
                    <div className="mt-3 flex items-center gap-4">
                       <div className="text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg inline-flex items-center gap-2 font-medium">
                          <AlertCircle className="w-3 h-3" /> Best ratio: 1:1 or 4:5
                       </div>
                       <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 hover:text-black">
                          <input 
                            type="checkbox" 
                            checked={isCarousel} 
                            onChange={(e) => setIsCarousel(e.target.checked)} 
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          Post as Carousel
                       </label>
                    </div>
                 )}
              </div>
              
              {/* Conditional YouTube Fields */}
              {selectedPlatforms.includes(Platform.YouTube) && (
                 <div className="bg-red-50 p-4 rounded-xl border border-red-100 space-y-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-wider mb-1">
                       <PlatformIcon platform={Platform.YouTube} size={14} /> YouTube Settings
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Video Title <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          value={youtubeTitle}
                          onChange={(e) => setYoutubeTitle(e.target.value)}
                          placeholder="Enter an engaging title..."
                          className="w-full bg-white border border-red-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl px-4 py-2 text-sm font-bold text-gray-900 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Thumbnail</label>
                        {youtubeThumbnail ? (
                           <div className="relative w-40 aspect-video rounded-lg overflow-hidden group border border-gray-200">
                              <img src={youtubeThumbnail.url} className="w-full h-full object-cover" />
                              <button onClick={() => setYoutubeThumbnail(null)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                 <X className="w-3 h-3" />
                              </button>
                           </div>
                        ) : (
                           <button onClick={() => handleMediaPickerOpen('thumbnail')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50">
                              <ImageIcon className="w-4 h-4" /> Select Thumbnail
                           </button>
                        )}
                    </div>
                 </div>
              )}

              {/* Editor with Variant Tabs */}
              <div className="flex-1 min-h-[200px] flex flex-col relative">
                 <div className="flex justify-between items-end mb-2">
                    {/* Variant Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg overflow-x-auto no-scrollbar max-w-[70%]">
                        {variants.map(v => (
                            <button
                                key={v.id}
                                onClick={() => handleSwitchVariant(v.id)}
                                className={`
                                    px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all whitespace-nowrap group flex items-center gap-2
                                    ${activeVariantId === v.id ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}
                                `}
                            >
                                {v.name}
                                {variants.length > 1 && (
                                    <span 
                                        onClick={(e) => handleDeleteVariant(e, v.id)}
                                        className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </span>
                                )}
                            </button>
                        ))}
                        <button onClick={handleAddVariant} className="px-2 py-1.5 text-gray-400 hover:text-black transition-colors rounded-md hover:bg-gray-200" title="Add Variant">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    
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
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center bg-white/80 backdrop-blur-sm p-1 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex gap-1">
                            <button onClick={() => handleMediaPickerOpen('main')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors" title="Add Media">
                                <ImageIcon className="w-4 h-4" />
                            </button>
                            
                            {/* Emoji Picker */}
                            <div className="relative">
                                <button onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowHashtags(false); }} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-yellow-500 transition-colors" title="Add Emoji">
                                    <Smile className="w-4 h-4" />
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute bottom-full left-0 mb-3 bg-white shadow-xl border border-gray-100 rounded-xl overflow-hidden z-20 w-64 animate-in zoom-in-95 duration-150">
                                        <div className="flex border-b border-gray-100 bg-gray-50">
                                           {Object.keys(EMOJI_CATEGORIES).map(cat => (
                                              <button 
                                                key={cat} 
                                                onClick={() => setCurrentEmojiCategory(cat)}
                                                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wide ${currentEmojiCategory === cat ? 'text-black bg-white border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'}`}
                                              >
                                                 {cat}
                                              </button>
                                           ))}
                                        </div>
                                        <div className="p-3 grid grid-cols-6 gap-2 bg-white max-h-40 overflow-y-auto custom-scrollbar">
                                            {EMOJI_CATEGORIES[currentEmojiCategory as keyof typeof EMOJI_CATEGORIES].map(e => (
                                               <button key={e} onClick={() => { handleInsertText(e); setShowEmojiPicker(false); }} className="hover:bg-gray-100 p-1.5 rounded text-xl flex items-center justify-center transition-colors">
                                                  {e}
                                               </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Hashtag Generator */}
                            <div className="relative">
                                <button onClick={() => { setShowHashtags(!showHashtags); setShowEmojiPicker(false); }} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-500 transition-colors" title="Smart Hashtags">
                                    <Hash className="w-4 h-4" />
                                </button>
                                {showHashtags && (
                                    <div className="absolute bottom-full left-0 mb-3 bg-white shadow-xl border border-gray-100 rounded-xl overflow-hidden z-20 w-64 animate-in zoom-in-95 duration-150">
                                        <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">AI Suggestions</span>
                                            <button onClick={handleFetchHashtags} className="text-blue-600 hover:bg-blue-100 p-1 rounded transition-colors" title="Refresh">
                                               <RefreshCw className={`w-3 h-3 ${isTagsLoading ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>
                                        <div className="p-2 flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                                            {suggestedHashtags.map(h => 
                                                <button 
                                                   key={h} 
                                                   onClick={() => { handleInsertText(h); setShowHashtags(false); }}
                                                   className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-medium transition-colors border border-blue-100"
                                                >
                                                   {h}
                                                </button>
                                            )}
                                            {suggestedHashtags.length === 0 && !isTagsLoading && (
                                               <div className="w-full text-center py-4 text-xs text-gray-400">Click refresh to generate tags for "{topic || 'your post'}".</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button className="p-2 bg-purple-50 rounded-lg shadow-sm text-purple-600 hover:bg-purple-100 border border-purple-100 transition-colors text-xs font-bold flex items-center gap-1.5 px-3" title="AI Rewrite">
                           <Zap className="w-3 h-3" /> Auto-Fix
                        </button>
                    </div>
                 </div>
              </div>

              {/* Media Preview */}
              {selectedMedia && (
                 <div className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-md group">
                    <button 
                       onClick={() => { setSelectedMedia(null); setSyncStatus('modified'); }}
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
                       onClick={() => { setAutoEngage(!autoEngage); setSyncStatus('modified'); }}
                       className={`relative w-10 h-6 rounded-full transition-colors ${autoEngage ? 'bg-green-500' : 'bg-gray-200'}`}
                       title="Auto-Reply Engagement Bot"
                    >
                       <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${autoEngage ? 'translate-x-4' : ''}`} />
                    </button>
                 </div>
              </div>

              {scheduleMode === 'later' && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                    <div className="relative flex items-center bg-gray-50 rounded-xl p-3 border border-gray-200 group hover:border-blue-300 transition-colors w-full">
                       <CalendarIcon className="w-5 h-5 text-gray-400 mr-3 group-hover:text-blue-500 transition-colors pointer-events-none" />
                       <span className="text-sm font-bold text-gray-900 pointer-events-none">
                          {scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                       </span>
                       <input 
                          type="date"
                          min={getFormattedDateValue(new Date())}
                          value={getFormattedDateValue(scheduledDate)}
                          onChange={(e) => {
                             if(e.target.value) {
                                const parts = e.target.value.split('-').map(Number);
                                const newDate = new Date(scheduledDate);
                                newDate.setFullYear(parts[0]);
                                newDate.setMonth(parts[1] - 1);
                                newDate.setDate(parts[2]);
                                setScheduledDate(newDate);
                             }
                          }}
                          onClick={(e) => {
                             try {
                                e.currentTarget.showPicker();
                             } catch (err) {}
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                       />
                    </div>
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
              
              {/* Timezone Indicator */}
              {postTimezone && (
                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wide justify-end px-1">
                    <Globe className="w-3 h-3" />
                    <span>Scheduling in {postTimezone}</span>
                 </div>
              )}

              <button
                 onClick={() => handlePublish(false)}
                 disabled={isSaving || isCheckingSafety || !content || selectedPlatforms.length === 0 || validationErrors.length > 0 || postStatus === PostStatus.NeedsReview}
                 className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
              >
                 {isSaving || isCheckingSafety ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                 ) : (
                    scheduleMode === 'now' ? <Send className="w-5 h-5" /> : <CalendarIcon className="w-5 h-5" />
                 )}
                 {isCheckingSafety ? 'Running Compliance Check...' : 
                  postStatus === PostStatus.NeedsReview ? 'Review Required' :
                  (scheduleMode === 'now' ? 'Publish Immediately' : 'Schedule Post')}
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
      
      {/* Safety Compliance Modal */}
      {showSafetyModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
                 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                    <ShieldCheck className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-bold text-red-900">Safety Check Warning</h3>
                 <p className="text-sm text-red-700 mt-2">
                    Our AI detected potential compliance issues with your content.
                 </p>
              </div>
              <div className="p-6">
                 <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
                    <ul className="space-y-2">
                       {safetyIssues.map((issue, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 font-medium">
                             <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                             {issue}
                          </li>
                       ))}
                    </ul>
                 </div>
                 <div className="flex gap-3">
                    <button 
                       onClick={() => setShowSafetyModal(false)}
                       className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                    >
                       Edit Post
                    </button>
                    <button 
                       onClick={() => handlePublish(true)}
                       className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
                    >
                       Publish Anyway
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <MediaPicker isOpen={isMediaPickerOpen} onClose={() => setIsMediaPickerOpen(false)} onSelect={handleMediaSelect} />
    </div>
  );
};
