import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, X, Clock, 
  ChevronDown, Image as ImageIcon, Trash2, Zap, Copy, Filter, Eye, Heart, 
  MessageCircle, Share, MoreHorizontal, AlertTriangle, LayoutList, Grid3X3,
  Bot, RefreshCw, ArrowRight, Globe, BarChart3, AlertCircle, CheckCircle,
  MessageSquare, Repeat, Heart as HeartOutline, Share2, Bookmark, Send
} from 'lucide-react';
import { store } from '../services/mockStore';
import { Post, Platform, PostStatus, MediaItem, BotType } from '../types';
import { PlatformIcon } from '../components/PlatformIcon';
import { MediaPicker } from '../components/MediaPicker';

// --- Constants & Helpers ---

const PLATFORM_LIMITS: Record<Platform, number> = {
  [Platform.Twitter]: 280,
  [Platform.LinkedIn]: 3000,
  [Platform.Instagram]: 2200,
  [Platform.Facebook]: 63206,
  [Platform.Threads]: 500,
  [Platform.YouTube]: 5000,
  [Platform.Discord]: 2000,
};

const TIMEZONES = [
  { label: 'UTC-5 (EST)', value: 'America/New_York' },
  { label: 'UTC-8 (PST)', value: 'America/Los_Angeles' },
  { label: 'UTC+0 (GMT)', value: 'Europe/London' },
  { label: 'UTC+5:30 (IST)', value: 'Asia/Kolkata' },
];

const getStatusStyle = (status: PostStatus) => {
  switch (status) {
    case PostStatus.Published: return 'bg-green-100 text-green-700 border-green-200';
    case PostStatus.Scheduled: return 'bg-blue-100 text-blue-700 border-blue-200';
    case PostStatus.Draft: return 'bg-gray-100 text-gray-700 border-gray-200';
    case PostStatus.Failed: return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const isPastDate = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

// Simulate AI Best Time Suggestion
const isBestTime = (day: number) => {
  return day % 3 === 0 || day % 7 === 0; // Mock logic
};

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  const [userSettings, setUserSettings] = useState<any>(null);
  
  // Filter & View State
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<PostStatus | 'All'>('All');
  const [viewMode, setViewMode] = useState<'Month' | 'Agenda'>('Month');
  const [selectedTimezone, setSelectedTimezone] = useState(TIMEZONES[0].value);

  // Drag & Drop State
  const [draggedPost, setDraggedPost] = useState<Post | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  
  // Form State
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState(''); // Added title state
  const [timeState, setTimeState] = useState({ hour: '09', minute: '00', period: 'AM' });
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([Platform.Twitter]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [autoEngage, setAutoEngage] = useState(false);
  
  // Preview State
  const [previewPlatform, setPreviewPlatform] = useState<Platform>(Platform.Twitter);

  // UI State
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  useEffect(() => {
    loadPosts();
    store.getSettings().then(setUserSettings);
  }, []);

  // Update preview platform when selected platforms change
  useEffect(() => {
    if (selectedPlatforms.length > 0 && !selectedPlatforms.includes(previewPlatform)) {
      setPreviewPlatform(selectedPlatforms[0]);
    }
  }, [selectedPlatforms]);

  const loadPosts = async () => {
    const fetchedPosts = await store.getPosts();
    setPosts(fetchedPosts);
  };

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const resetForm = () => {
    setNewPostContent('');
    setNewPostTitle('');
    setSelectedMedia(null);
    setAutoEngage(false);
    setEditingPost(null);
    setSelectedPlatforms([Platform.Twitter]);
    setPreviewPlatform(Platform.Twitter);
    setTimeState({ hour: '09', minute: '00', period: 'AM' });
  };

  const handleCreateEvent = () => {
    resetForm();
    if (isPastDate(selectedDate)) {
      setSelectedDate(new Date());
    }
    setIsModalOpen(true);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setNewPostContent(post.content);
    setNewPostTitle(post.title || '');
    setSelectedPlatforms(post.platforms);
    setPreviewPlatform(post.platforms[0] || Platform.Twitter);
    
    if (post.mediaUrl) {
       const isVideo = post.mediaType === 'video' || post.mediaUrl.toLowerCase().endsWith('.mp4');
       setSelectedMedia({ 
         id: 'mock', 
         name: 'Existing Media', 
         type: isVideo ? 'video' : 'image', 
         url: post.mediaUrl, 
         size: 0, 
         createdAt: '' 
       });
    } else {
      setSelectedMedia(null);
    }
    
    // Parse time
    const date = new Date(post.scheduledFor);
    let hours = date.getHours();
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    setTimeState({ hour: hours.toString().padStart(2, '0'), minute: minutes, period });
    setSelectedDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
    setIsModalOpen(true);
  };

  // --- Drag & Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, post: Post) => {
    setDraggedPost(post);
    e.dataTransfer.setData('text/plain', post.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (!draggedPost) return;

    if (isPastDate(date) && draggedPost.status === PostStatus.Scheduled) {
       alert("Cannot schedule posts in the past.");
       setDraggedPost(null);
       return;
    }

    const originalDate = new Date(draggedPost.scheduledFor);
    const newDate = new Date(date);
    newDate.setHours(originalDate.getHours(), originalDate.getMinutes(), 0, 0);

    const updatedPost = {
      ...draggedPost,
      scheduledFor: newDate.toISOString()
    };

    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    await store.updatePost(updatedPost);
    setDraggedPost(null);
    await loadPosts();
  };

  const handleDeletePost = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm("Are you sure you want to delete this scheduled post?")) {
      await store.deletePost(id);
      await loadPosts();
    }
  };

  const handleDeleteFromModal = async () => {
    if (!editingPost) return;
    if (confirm("Are you sure you want to delete this scheduled post?")) {
      try {
        await store.deletePost(editingPost.id);
        setEditingPost(null);
        setIsModalOpen(false);
        await loadPosts();
      } catch (err) {
        console.error("Failed to delete post", err);
      }
    }
  };

  const handleDuplicatePost = async (e: React.MouseEvent, post: Post) => {
    e.stopPropagation();
    e.preventDefault();
    const newPost = {
      ...post,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: `(Copy) ${post.content}`,
      status: PostStatus.Draft,
      scheduledFor: post.scheduledFor 
    };
    await store.addPost(newPost);
    await loadPosts();
  };

  const handleMoveToTomorrow = async (e: React.MouseEvent, post: Post) => {
    e.stopPropagation();
    e.preventDefault();
    const current = new Date(post.scheduledFor);
    current.setDate(current.getDate() + 1);
    const updatedPost = { ...post, scheduledFor: current.toISOString() };
    await store.updatePost(updatedPost);
    await loadPosts();
  };

  const handleSavePost = async () => {
    if (!newPostContent && !selectedMedia) return;

    let hours = parseInt(timeState.hour);
    if (timeState.period === 'PM' && hours !== 12) hours += 12;
    else if (timeState.period === 'AM' && hours === 12) hours = 0;

    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(hours, parseInt(timeState.minute), 0, 0);

    const postData: Post = {
      id: editingPost ? editingPost.id : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newPostTitle,
      content: newPostContent,
      platforms: selectedPlatforms,
      scheduledFor: scheduledDateTime.toISOString(),
      status: editingPost ? editingPost.status : PostStatus.Scheduled,
      generatedByAi: editingPost ? editingPost.generatedByAi : false,
      mediaUrl: selectedMedia?.url,
      mediaType: selectedMedia?.type,
    };

    if (editingPost) await store.updatePost(postData);
    else await store.addPost(postData);

    await loadPosts();
    setIsModalOpen(false);
  };

  // --- Logic & Filtering ---
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const getPostsForDate = (date: Date) => {
    return posts.filter(post => {
      const pDate = new Date(post.scheduledFor);
      return pDate.getDate() === date.getDate() && 
             pDate.getMonth() === date.getMonth() && 
             pDate.getFullYear() === date.getFullYear();
    });
  };

  // Helper for rendering
  const hasConflict = (post: Post) => {
     // Simplistic conflict check
     return false;
  };

  const rawPostsForDate = getPostsForDate(selectedDate);
  const filteredPosts = rawPostsForDate.filter(p => {
    if (filterPlatform !== 'All' && !p.platforms.includes(filterPlatform)) return false;
    if (filterStatus !== 'All' && p.status !== filterStatus) return false;
    return true;
  }).sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());

  const getAgendaPosts = () => {
    return posts
      .filter(p => new Date(p.scheduledFor) >= new Date())
      .filter(p => filterPlatform === 'All' || p.platforms.includes(filterPlatform))
      .filter(p => filterStatus === 'All' || p.status === filterStatus)
      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
      .slice(0, 20);
  };

  const charCount = newPostContent.length;
  const isOverLimit = selectedPlatforms.some(p => charCount > (PLATFORM_LIMITS[p] || 5000));
  const getFormattedDateValue = (date: Date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Preview Truncation
  const previewLimit = PLATFORM_LIMITS[previewPlatform] || 500;
  const displayContent = newPostContent ? newPostContent.slice(0, previewLimit) : '';

  // Render Logic for specific platforms (Synced with CreatorStudio)
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
                   <HeartOutline className="w-4 h-4" />
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
                     <HeartOutline className="w-6 h-6 text-black" />
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
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 line-clamp-2">{newPostTitle || "Video Title Goes Here"}</h3>
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
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-700">
      {/* Header (Same as before) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between px-2 gap-4">
        <div>
          <h1 className="text-[34px] font-bold text-[#1d1d1f] tracking-tight">Calendar</h1>
          <div className="flex items-center gap-2 mt-1">
             <Globe className="w-4 h-4 text-gray-400" />
             <select 
               value={selectedTimezone}
               onChange={(e) => setSelectedTimezone(e.target.value)}
               className="bg-transparent text-sm font-medium text-gray-500 hover:text-gray-800 outline-none cursor-pointer"
             >
                {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
             </select>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
           <div className="bg-white border border-gray-200 rounded-lg p-1 flex">
              <button 
                onClick={() => setViewMode('Month')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'Month' ? 'bg-gray-100 text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
              >
                <Grid3X3 className="w-3.5 h-3.5" /> Month
              </button>
              <button 
                onClick={() => setViewMode('Agenda')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'Agenda' ? 'bg-gray-100 text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
              >
                <LayoutList className="w-3.5 h-3.5" /> Agenda
              </button>
           </div>
           <button onClick={() => setSelectedDate(new Date())} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
              Today
           </button>
           <button onClick={handleCreateEvent} className="px-5 py-2 bg-black text-white rounded-lg text-sm font-semibold shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Post
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 h-full overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-[32px] border border-black/5 shadow-sm p-6 flex flex-col overflow-hidden">
          {viewMode === 'Month' && (
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-bold text-gray-900">
                 {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
               </h2>
               <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                 <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-full transition-shadow hover:shadow-sm"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
                 <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-full transition-shadow hover:shadow-sm"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
               </div>
            </div>
          )}

          {viewMode === 'Month' ? (
            <>
              <div className="grid grid-cols-7 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 grid-rows-5 gap-2 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                 {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} />
                 ))}
                 {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const dayPosts = getPostsForDate(date);
                    const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth();
                    const isToday = new Date().toDateString() === date.toDateString();
                    const isPast = isPastDate(date);
                    const isSuggested = isBestTime(day) && !isPast; 

                    return (
                      <div 
                        key={day}
                        onClick={() => handleDateClick(date)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, date)}
                        className={`
                          relative rounded-xl p-2 transition-all duration-300 border flex flex-col justify-between group
                          ${isPast ? 'bg-gray-50/50 hover:bg-gray-50' : 'cursor-pointer hover:bg-gray-50'}
                          ${isSelected
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105 z-10 border-transparent ring-0' 
                            : 'bg-white text-gray-700 border-transparent hover:border-gray-100'}
                          ${isToday && !isSelected ? 'ring-2 ring-blue-500 ring-offset-1 z-0' : ''}
                          ${isSuggested && !isSelected && !isPast ? 'shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)] border-blue-100' : ''}
                        `}
                      >
                        <div className="flex justify-between items-start">
                           <span className={`text-sm font-bold ${isSelected ? 'text-white' : isPast ? 'text-gray-400' : 'text-gray-900'}`}>{day}</span>
                           {isSuggested && !isSelected && !isPast && (
                             <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" title="AI Suggested Day"></div>
                           )}
                        </div>
                        {!isPast && !isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                             <div className="bg-blue-50 text-blue-600 p-1.5 rounded-full shadow-sm">
                               <Plus className="w-3 h-3" />
                             </div>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1 justify-end">
                           {dayPosts.slice(0, 6).map((p, idx) => (
                              <PlatformIcon 
                                key={idx} 
                                platform={p.platforms[0]} 
                                size={10} 
                                white={isSelected} 
                                className={isSelected ? 'opacity-90' : ''}
                              />
                           ))}
                           {dayPosts.length > 6 && (
                             <div className={`text-[8px] font-bold ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>+</div>
                           )}
                        </div>
                      </div>
                    );
                 })}
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
               {/* Agenda View Content same as before */}
               <h3 className="text-lg font-bold text-gray-800 sticky top-0 bg-white py-2 z-10 border-b border-gray-100">Upcoming Agenda</h3>
               {getAgendaPosts().map(post => (
                 <div key={post.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors group cursor-pointer" onClick={() => handleEditPost(post)}>
                    <div className="flex flex-col items-center justify-center w-16 bg-white rounded-lg border border-gray-200 shadow-sm shrink-0">
                       <span className="text-xs font-bold text-gray-500 uppercase">{new Date(post.scheduledFor).toLocaleDateString('en-US', { month: 'short' })}</span>
                       <span className="text-xl font-bold text-gray-900">{new Date(post.scheduledFor).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{new Date(post.scheduledFor).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          <div className="flex -space-x-1">
                             {post.platforms.map(p => (
                               <div key={p} className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                                  <PlatformIcon platform={p} size={10} />
                               </div>
                             ))}
                          </div>
                       </div>
                       <p className="text-sm text-gray-700 font-medium truncate">{post.content}</p>
                    </div>
                    <div className="flex items-center">
                       <button className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-blue-600 transition-colors">
                          <Eye className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>

        {/* Right: Day View / Detail Sidebar */}
        <div className="w-full lg:w-[400px] bg-[#F5F5F7]/80 backdrop-blur-xl rounded-[32px] border border-white/60 flex flex-col h-full overflow-hidden shadow-xl shadow-gray-200/50">
           {/* Sidebar Timeline Content same as before */}
           <div className="p-6 border-b border-gray-200/50 bg-white/60 sticky top-0 z-20 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                 <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Selected Date</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </h3>
              <div className="mt-5 flex flex-col gap-3">
                 <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar items-center">
                   <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                   <button 
                      onClick={() => setFilterPlatform('All')}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${filterPlatform === 'All' ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'}`}
                   >
                     All
                   </button>
                   {Object.values(Platform).map(p => (
                     <button
                       key={p}
                       onClick={() => setFilterPlatform(p)}
                       className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${filterPlatform === p ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'}`}
                     >
                       <PlatformIcon platform={p} size={12} white={filterPlatform === p} />
                     </button>
                   ))}
                 </div>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6 relative">
              {filteredPosts.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                    <CalendarIcon className="w-8 h-8 text-gray-300 mb-4" />
                    <p className="font-medium text-sm text-center px-8">No posts found.</p>
                 </div>
              ) : (
                <>
                <div className="absolute left-9 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent z-0 hidden lg:block" />
                {filteredPosts.map((post, idx) => (
                  <div 
                     key={post.id} 
                     className="relative z-10 animate-in slide-in-from-right-4 duration-500" 
                     draggable={post.status !== PostStatus.Published}
                     onDragStart={(e) => handleDragStart(e, post)}
                     onClick={() => handleEditPost(post)}
                  >
                     <div className="flex gap-4 group cursor-pointer">
                        <div className="w-12 pt-2 flex flex-col items-center gap-2 shrink-0">
                           <span className="text-[11px] font-bold text-gray-500 uppercase leading-tight text-center">
                             {new Date(post.scheduledFor).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).replace(' ', '\n')}
                           </span>
                           <div className={`w-2.5 h-2.5 rounded-full border-2 z-10 bg-white border-gray-300 group-hover:border-blue-500`}></div>
                        </div>
                        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-blue-100 p-3">
                           <div className="flex justify-between items-center mb-2">
                              <div className="flex -space-x-2 pl-1">
                                 {post.platforms.map((p, i) => (
                                    <div key={p} className="w-6 h-6 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center z-10 relative" style={{ zIndex: 10 - i }}>
                                       <PlatformIcon platform={p} size={12} />
                                    </div>
                                 ))}
                              </div>
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusStyle(post.status)}`}>{post.status}</span>
                           </div>
                           <p className="text-sm font-medium text-gray-700 line-clamp-2">{post.content}</p>
                        </div>
                     </div>
                  </div>
                ))}
                </>
              )}
           </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
           <div className="relative bg-white w-full max-w-5xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[90vh]">
              <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                 <h2 className="text-xl font-bold text-gray-900">{editingPost ? 'Edit Post' : 'New Post'}</h2>
                 <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                    <X className="w-4 h-4" />
                 </button>
              </div>

              <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 lg:border-r border-gray-100">
                    <section className="space-y-3">
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Target Platforms</label>
                       <div className="flex flex-wrap gap-2">
                          {Object.values(Platform).map(p => {
                             const isSelected = selectedPlatforms.includes(p);
                             return (
                                <button
                                   key={p}
                                   onClick={() => isSelected ? setSelectedPlatforms(prev => prev.filter(i => i !== p)) : setSelectedPlatforms(prev => [...prev, p])}
                                   className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-200 ${isSelected ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200'}`}
                                >
                                   <PlatformIcon platform={p} size={16} white={isSelected} />
                                   <span className="text-sm font-semibold">{p}</span>
                                </button>
                             );
                          })}
                       </div>
                    </section>
                    
                    {/* YouTube Title Field */}
                    {selectedPlatforms.includes(Platform.YouTube) && (
                       <section className="space-y-3">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Video Title</label>
                          <input 
                             type="text"
                             value={newPostTitle}
                             onChange={(e) => setNewPostTitle(e.target.value)}
                             placeholder="YouTube video title"
                             className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold text-gray-900"
                          />
                       </section>
                    )}

                    <section className="space-y-3">
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Content</label>
                       <textarea
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          placeholder="Write your masterpiece..."
                          rows={6}
                          className="w-full bg-gray-50 rounded-2xl p-4 text-gray-900 placeholder:text-gray-400 border-none focus:ring-2 focus:ring-blue-500/20"
                       />
                       
                       {selectedMedia ? (
                          <div className="relative rounded-2xl overflow-hidden group shadow-sm bg-gray-100 h-48">
                              {selectedMedia.type === 'image' ? <img src={selectedMedia.url} className="w-full h-full object-cover" /> : <video src={selectedMedia.url} className="w-full h-full object-cover" controls />}
                              <button onClick={() => setSelectedMedia(null)} className="absolute top-2 right-2 p-1.5 bg-black/40 text-white rounded-full"><X className="w-4 h-4" /></button>
                          </div>
                       ) : (
                          <button onClick={() => setIsMediaPickerOpen(true)} className="w-full h-16 rounded-2xl border border-dashed border-gray-300 flex items-center justify-center gap-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all font-medium text-sm">
                             <ImageIcon className="w-5 h-5" /> Add Photo or Video
                          </button>
                       )}
                    </section>
                 </div>

                 {/* Preview Column in Modal (Synced with CreatorStudio Preview) */}
                 <div className="hidden lg:flex flex-1 min-w-[320px] max-w-[400px] bg-slate-100 p-6 flex-col border-l border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Preview</h3>
                       {selectedPlatforms.length > 1 && (
                          <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm">
                             {selectedPlatforms.map(p => (
                                <button key={p} onClick={() => setPreviewPlatform(p)} className={`p-1.5 rounded-md transition-all ${previewPlatform === p ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
                                   <PlatformIcon platform={p} size={14} white={previewPlatform === p} />
                                </button>
                             ))}
                          </div>
                       )}
                    </div>
                    <div className="flex-1 bg-white rounded-3xl shadow-xl border border-white/50 overflow-hidden flex flex-col relative">
                       <div className="h-12 border-b border-gray-50 flex items-center justify-center relative bg-white/80 backdrop-blur-sm">
                          <PlatformIcon platform={previewPlatform} size={20} />
                       </div>
                       <div className="p-0 overflow-y-auto custom-scrollbar flex-1 bg-gray-50">
                          {renderPreviewContent()}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="px-8 py-5 bg-white border-t border-gray-100 flex justify-between items-center sticky bottom-0 z-20">
                 {editingPost ? (
                    <button onClick={handleDeleteFromModal} className="text-red-500 hover:text-red-700 font-bold text-sm flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete</button>
                 ) : <div></div>}
                 <div className="flex gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-full font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
                    <button onClick={handleSavePost} disabled={(!newPostContent && !selectedMedia) || isOverLimit} className="px-8 py-3 bg-black text-white rounded-full font-bold shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                       {editingPost ? 'Update' : 'Schedule'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
      
      <MediaPicker isOpen={isMediaPickerOpen} onClose={() => setIsMediaPickerOpen(false)} onSelect={setSelectedMedia} />
    </div>
  );
};