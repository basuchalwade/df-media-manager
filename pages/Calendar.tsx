import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, X, Clock, 
  ChevronDown, Image as ImageIcon, Trash2, Zap, Copy, Filter, Eye, Heart, 
  MessageCircle, Share, MoreHorizontal, AlertTriangle, LayoutList, Grid3X3,
  Bot, RefreshCw, ArrowRight, Globe, BarChart3, AlertCircle, CheckCircle
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

const getPlatformColor = (platform: Platform) => {
  switch (platform) {
    case Platform.Twitter: return 'bg-blue-400';
    case Platform.Facebook: return 'bg-blue-600';
    case Platform.Instagram: return 'bg-pink-500';
    case Platform.LinkedIn: return 'bg-blue-700';
    case Platform.YouTube: return 'bg-red-600';
    case Platform.Discord: return 'bg-indigo-500';
    case Platform.Threads: return 'bg-slate-900';
    default: return 'bg-gray-400';
  }
};

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
    // Allows selecting past dates to view history, but creating new events on past is blocked in handler
    setSelectedDate(date);
  };

  const resetForm = () => {
    setNewPostContent('');
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
    setSelectedPlatforms(post.platforms);
    setPreviewPlatform(post.platforms[0] || Platform.Twitter);
    
    if (post.mediaUrl) {
       setSelectedMedia({ id: 'mock', name: 'Existing Media', type: 'image', url: post.mediaUrl, size: 0, createdAt: '' });
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
    // Add a ghost image or styling if desired
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (!draggedPost) return;

    // Prevent dragging to past if it's not already in past? 
    // Usually schedulers allow dragging to past to create "historical records" but let's block for now to be safe
    if (isPastDate(date) && draggedPost.status === PostStatus.Scheduled) {
       alert("Cannot schedule posts in the past.");
       setDraggedPost(null);
       return;
    }

    // Preserve original time
    const originalDate = new Date(draggedPost.scheduledFor);
    const newDate = new Date(date);
    newDate.setHours(originalDate.getHours(), originalDate.getMinutes(), 0, 0);

    const updatedPost = {
      ...draggedPost,
      scheduledFor: newDate.toISOString()
    };

    // Optimistic Update
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    
    await store.updatePost(updatedPost);
    setDraggedPost(null);
    await loadPosts(); // Refresh from store to be sure
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
    
    const updatedPost = {
      ...post,
      scheduledFor: current.toISOString()
    };
    
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
      content: newPostContent,
      platforms: selectedPlatforms,
      scheduledFor: scheduledDateTime.toISOString(),
      status: editingPost ? editingPost.status : PostStatus.Scheduled,
      generatedByAi: editingPost ? editingPost.generatedByAi : false,
      mediaUrl: selectedMedia?.url,
    };

    if (editingPost) {
      await store.updatePost(postData);
    } else {
      await store.addPost(postData);
    }

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

  // Conflict Detection
  const getConflictWarning = (post: Post | null, proposedTime?: Date): string | null => {
     if (!post && !proposedTime) return null;
     
     // Determine time to check against
     const targetTime = proposedTime ? proposedTime.getTime() : new Date(post!.scheduledFor).getTime();
     const targetId = post ? post.id : 'new';
     const targetPlatforms = proposedTime ? selectedPlatforms : post!.platforms;

     // Check for posts within 15 minutes on same platform
     const conflicts = posts.filter(p => {
        if (p.id === targetId) return false;
        const pTime = new Date(p.scheduledFor).getTime();
        const timeDiff = Math.abs(targetTime - pTime);
        const hasSharedPlatform = p.platforms.some(plat => targetPlatforms.includes(plat));
        
        return hasSharedPlatform && timeDiff < 15 * 60 * 1000;
     });

     if (conflicts.length > 0) return "High posting frequency detected (within 15m)";
     return null;
  };

  // Helper for rendering
  const hasConflict = (post: Post) => !!getConflictWarning(post);

  // Filter Logic
  const rawPostsForDate = getPostsForDate(selectedDate);
  const filteredPosts = rawPostsForDate.filter(p => {
    if (filterPlatform !== 'All' && !p.platforms.includes(filterPlatform)) return false;
    if (filterStatus !== 'All' && p.status !== filterStatus) return false;
    return true;
  }).sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());

  // Agenda View Logic
  const getAgendaPosts = () => {
    return posts
      .filter(p => new Date(p.scheduledFor) >= new Date())
      .filter(p => filterPlatform === 'All' || p.platforms.includes(filterPlatform))
      .filter(p => filterStatus === 'All' || p.status === filterStatus)
      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
      .slice(0, 20);
  };

  // Character Count Logic
  const charCount = newPostContent.length;
  const maxChars = Math.min(...selectedPlatforms.map(p => PLATFORM_LIMITS[p] || 5000));
  const isOverLimit = charCount > maxChars;

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-700">
      
      {/* Header */}
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
           {/* View Toggle */}
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
        
        {/* Main Content Area (Month Grid or Agenda) */}
        <div className="flex-1 bg-white rounded-[32px] border border-black/5 shadow-sm p-6 flex flex-col overflow-hidden">
          
          {/* Calendar Controls */}
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
                    const isDragOver = false; // Could add state for visual feedback

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
                        
                        {/* Hover Add Button */}
                        {!isPast && !isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                             <div className="bg-blue-50 text-blue-600 p-1.5 rounded-full shadow-sm">
                               <Plus className="w-3 h-3" />
                             </div>
                          </div>
                        )}

                        {/* Activity Density Indicators - Replaced with Platform Icons */}
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
            // AGENDA VIEW
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
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
                          {hasConflict(post) && (
                            <div title="High posting frequency detected" className="flex items-center">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            </div>
                          )}
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
               {getAgendaPosts().length === 0 && (
                 <div className="text-center py-10 text-gray-400">No upcoming posts found.</div>
               )}
            </div>
          )}
        </div>

        {/* Right: Day View / Detail Sidebar */}
        <div className="w-full lg:w-[400px] bg-[#F5F5F7]/80 backdrop-blur-xl rounded-[32px] border border-white/60 flex flex-col h-full overflow-hidden shadow-xl shadow-gray-200/50">
           {/* Sticky Header */}
           <div className="p-6 border-b border-gray-200/50 bg-white/60 sticky top-0 z-20 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                 <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Selected Date</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </h3>
              
              {/* Platform Filter */}
              <div className="mt-5 flex flex-col gap-3">
                 {/* Platform Chips */}
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
                 
                 {/* Status Chips */}
                 <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar items-center border-t border-gray-200/50 pt-2">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Status:</span>
                   {['All', PostStatus.Draft, PostStatus.Scheduled, PostStatus.Published, PostStatus.Failed].map(s => (
                     <button
                       key={s}
                       onClick={() => setFilterStatus(s as PostStatus | 'All')}
                       className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all whitespace-nowrap ${filterStatus === s ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-white'}`}
                     >
                       {s}
                     </button>
                   ))}
                 </div>
              </div>
           </div>

           {/* Timeline Feed */}
           <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6 relative">
              {filteredPosts.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                    <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 border border-dashed border-gray-300">
                       <CalendarIcon className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="font-medium text-sm text-center px-8">
                      No posts found for this filter.
                    </p>
                    <button onClick={handleCreateEvent} className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-100 transition-colors">
                       Create Post
                    </button>
                 </div>
              ) : (
                <>
                {/* Timeline Line */}
                <div className="absolute left-9 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent z-0 hidden lg:block" />
                
                {filteredPosts.map((post, idx) => {
                  const postDate = new Date(post.scheduledFor);
                  const timeString = postDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                  const conflict = hasConflict(post);

                  return (
                  <div 
                     key={post.id} 
                     className="relative z-10 animate-in slide-in-from-right-4 duration-500" 
                     style={{ animationDelay: `${idx * 100}ms` }}
                     draggable={post.status !== PostStatus.Published} // Only drag future posts
                     onDragStart={(e) => handleDragStart(e, post)}
                  >
                     <div className="flex gap-4 group">
                        {/* Time Column */}
                        <div 
                          className="w-12 pt-2 flex flex-col items-center gap-2 shrink-0 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => handleEditPost(post)}
                          title="Click to details"
                        >
                           <span className="text-[11px] font-bold text-gray-500 group-hover:text-blue-600 uppercase leading-tight text-center transition-colors">
                             {timeString.replace(' ', '\n')}
                           </span>
                           <div className={`w-2.5 h-2.5 rounded-full border-2 z-10 transition-colors shadow-sm ${conflict ? 'bg-amber-500 border-amber-200 animate-pulse' : 'bg-white border-gray-300 group-hover:border-blue-500'}`}></div>
                        </div>

                        {/* Post Card */}
                        <div 
                          className={`
                            flex-1 bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border transition-all group overflow-hidden cursor-pointer relative
                            ${conflict ? 'border-amber-200 shadow-amber-100' : 'border-gray-100 hover:border-blue-100'}
                            ${draggedPost?.id === post.id ? 'opacity-50 scale-95' : ''}
                          `}
                          onClick={() => handleEditPost(post)}
                        >
                           
                           {/* Card Header: Platform Icons & Quick Actions */}
                           <div className="flex justify-between items-center p-3 border-b border-gray-50 bg-gray-50/30">
                              <div className="flex items-center -space-x-2 pl-1">
                                 {post.platforms.map((p, i) => (
                                    <div 
                                      key={p} 
                                      className="w-7 h-7 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center z-10 relative hover:z-20 hover:scale-110 transition-transform"
                                      style={{ zIndex: 10 - i }}
                                    >
                                       <PlatformIcon platform={p} size={14} />
                                    </div>
                                 ))}
                              </div>
                              <div className="flex items-center gap-2">
                                {conflict && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusStyle(post.status)}`}>
                                   {post.status}
                                </span>
                              </div>
                           </div>
                           
                           {/* Floating Actions */}
                           <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 bg-white/95 backdrop-blur-sm p-1 rounded-lg border border-gray-100 shadow-sm transform translate-y-2 group-hover:translate-y-0">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleEditPost(post); }}
                                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                  title="Details"
                                  type="button"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                {post.status !== PostStatus.Published && (
                                   <button 
                                      onClick={(e) => handleMoveToTomorrow(e, post)}
                                      className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                      title="Move to Tomorrow"
                                      type="button"
                                   >
                                      <ArrowRight className="w-3.5 h-3.5" />
                                   </button>
                                )}
                                <button 
                                  onClick={(e) => handleDuplicatePost(e, post)}
                                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                  title="Duplicate"
                                  type="button"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={(e) => handleDeletePost(e, post.id)}
                                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  title="Delete"
                                  type="button"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                           </div>

                           {/* Card Content */}
                           <div className="p-3 flex gap-3">
                              {/* Content Text */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-700 line-clamp-3 leading-relaxed group-hover:text-gray-900 transition-colors">
                                   {post.content}
                                </p>
                                
                                <div className="flex items-center gap-2 mt-2">
                                  {post.generatedByAi && (
                                     <div className="flex items-center gap-1 text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                                        <Bot className="w-3 h-3" /> AI Bot
                                     </div>
                                  )}
                                  {post.engagement && (
                                    <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                       <span className="flex items-center gap-0.5"><Heart className="w-3 h-3 text-red-400 fill-red-400" /> {post.engagement.likes}</span>
                                       <span className="flex items-center gap-0.5"><MessageCircle className="w-3 h-3 text-blue-400" /> {post.engagement.comments}</span>
                                    </div>
                                  )}
                                </div>

                                {conflict && (
                                  <p className="text-[10px] text-amber-600 mt-1 font-semibold">⚠ Conflict: High posting frequency.</p>
                                )}
                              </div>

                              {/* Media Thumbnail (Right Side) */}
                              {post.mediaUrl && (
                                 <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-100 shadow-sm bg-gray-50 relative group/media">
                                    {post.mediaUrl.endsWith('.mp4') ? (
                                       <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                          <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[8px] border-l-white border-b-[4px] border-b-transparent ml-0.5"></div>
                                       </div>
                                    ) : (
                                       <img src={post.mediaUrl} className="w-full h-full object-cover transition-transform group-hover/media:scale-110" alt="Post Media" />
                                    )}
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
                )})}
                </>
              )}
           </div>
        </div>
      </div>

      {/* Modern Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
           <div className="relative bg-white w-full max-w-5xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[90vh]">
              
              <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                 <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">{editingPost ? (editingPost.status === PostStatus.Published ? 'Post Details' : 'Edit Post') : 'New Post'}</h2>
                    {editingPost && (
                       <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${getStatusStyle(editingPost.status)}`}>
                          {editingPost.status}
                       </span>
                    )}
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                    <X className="w-4 h-4" />
                 </button>
              </div>

              {editingPost?.status === PostStatus.Published ? (
                // --- READ ONLY / HISTORY VIEW ---
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                         <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Post Performance</h3>
                            <div className="grid grid-cols-3 gap-4">
                               <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                                     <Heart className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Likes</span>
                                  </div>
                                  <p className="text-2xl font-bold text-slate-900">{editingPost.engagement?.likes || 0}</p>
                               </div>
                               <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                                     <MessageCircle className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Comments</span>
                                  </div>
                                  <p className="text-2xl font-bold text-slate-900">{editingPost.engagement?.comments || 0}</p>
                               </div>
                               <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                                     <Share className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Shares</span>
                                  </div>
                                  <p className="text-2xl font-bold text-slate-900">{editingPost.engagement?.shares || 0}</p>
                               </div>
                            </div>
                         </div>
                         
                         <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Published Content</h3>
                            <div className="p-6 bg-white border border-slate-200 rounded-2xl">
                               <p className="text-slate-800 text-lg leading-relaxed">{editingPost.content}</p>
                               {editingPost.mediaUrl && (
                                 <div className="mt-4 rounded-xl overflow-hidden">
                                    <img src={editingPost.mediaUrl} className="max-w-full max-h-64 object-cover" alt="Post media" />
                                 </div>
                               )}
                            </div>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="bg-green-50 border border-green-100 p-6 rounded-2xl flex items-start gap-4">
                            <div className="p-2 bg-green-100 rounded-full text-green-600">
                               <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                               <h4 className="font-bold text-green-900">Successfully Published</h4>
                               <p className="text-green-800/80 text-sm mt-1">Posted on {new Date(editingPost.scheduledFor).toLocaleString()}</p>
                               <div className="flex gap-2 mt-3">
                                  {editingPost.platforms.map(p => (
                                     <span key={p} className="bg-white px-2 py-1 rounded shadow-sm text-xs font-bold text-slate-600 flex items-center gap-1">
                                        <PlatformIcon platform={p} size={12} /> {p}
                                     </span>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              ) : (
                // --- EDIT / CREATE VIEW ---
                <div className="flex flex-col lg:flex-row h-full overflow-hidden">
                   {/* Left Column: Edit Form */}
                   <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 lg:border-r border-gray-100">
                      
                      {/* 1. Date & Time */}
                      <section className="space-y-3">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">When</label>
                         <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 bg-gray-50 rounded-2xl p-4 flex items-center gap-3 border border-transparent hover:border-gray-200 transition-colors group">
                               <CalendarIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                               <span className="font-semibold text-gray-900">{selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className="relative flex-1">
                               <button 
                                  onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
                                  className="w-full h-full bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-transparent hover:border-gray-200 transition-colors"
                               >
                                  <div className="flex items-center gap-3">
                                     <Clock className="w-5 h-5 text-gray-400" />
                                     <span className="font-semibold text-gray-900">{timeState.hour}:{timeState.minute} {timeState.period}</span>
                                  </div>
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                               </button>
                               
                               {isTimePickerOpen && (
                                  <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-20 w-64 grid grid-cols-3 gap-2">
                                     <div className="col-span-3 text-xs text-center font-bold text-gray-400 mb-2">PICK TIME</div>
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
                                     <button onClick={() => setIsTimePickerOpen(false)} className="col-span-3 mt-2 bg-blue-50 text-blue-600 text-xs font-bold py-2 rounded-lg">Done</button>
                                  </div>
                               )}
                            </div>
                         </div>
                      </section>

                      {/* 2. Platforms */}
                      <section className="space-y-3">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Where</label>
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
                                        flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-200
                                        ${isSelected 
                                           ? 'bg-black text-white border-black shadow-lg shadow-black/10 scale-105' 
                                           : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}
                                     `}
                                  >
                                     <PlatformIcon platform={p} size={16} white={isSelected} />
                                     <span className="text-sm font-semibold">{p}</span>
                                  </button>
                               );
                            })}
                         </div>
                      </section>

                      {/* 3. Content */}
                      <section className="space-y-3">
                         <div className="flex justify-between items-end">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">What</label>
                            <span className={`text-[10px] font-bold ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
                              {charCount} / {maxChars} chars
                            </span>
                         </div>
                         <div className="relative">
                            <textarea
                               value={newPostContent}
                               onChange={(e) => setNewPostContent(e.target.value)}
                               placeholder="Write your masterpiece..."
                               rows={6}
                               className={`
                                 w-full bg-gray-50 rounded-2xl p-4 pr-12 text-gray-900 placeholder:text-gray-400 border-none focus:ring-2 focus:bg-white transition-colors resize-none leading-relaxed
                                 ${isOverLimit ? 'focus:ring-red-500/20 ring-2 ring-red-500/10' : 'focus:ring-blue-500/20'}
                               `}
                            />
                            <button className="absolute bottom-3 right-3 p-2 bg-white rounded-full text-purple-500 shadow-sm hover:scale-110 transition-transform" title="Voice to Text (Coming Soon)">
                               <Zap className="w-4 h-4" />
                            </button>
                         </div>
                         
                         {isOverLimit && (
                           <div className="flex items-center gap-2 text-red-500 text-xs font-semibold animate-in slide-in-from-top-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Character limit exceeded for one or more platforms.
                           </div>
                         )}

                         {/* Media Slot */}
                         {selectedMedia ? (
                            <div className="relative rounded-2xl overflow-hidden group shadow-sm bg-gray-100">
                               {selectedMedia.type === 'image' ? (
                                  <img src={selectedMedia.url} className="w-full h-48 object-cover" alt="Preview" />
                               ) : (
                                  <div className="w-full h-48 bg-gray-900 flex items-center justify-center text-white"><span className="font-bold">VIDEO FILE</span></div>
                               )}
                               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                  <p className="text-white font-medium text-sm truncate">{selectedMedia.name}</p>
                               </div>
                               <button onClick={() => setSelectedMedia(null)} className="absolute top-2 right-2 p-1.5 bg-black/40 text-white rounded-full backdrop-blur-md hover:bg-black/60">
                                  <X className="w-4 h-4" />
                               </button>
                            </div>
                         ) : (
                            <button 
                               onClick={() => setIsMediaPickerOpen(true)}
                               className="w-full h-16 rounded-2xl border border-dashed border-gray-300 flex items-center justify-center gap-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 hover:border-blue-300 transition-all font-medium text-sm"
                            >
                               <ImageIcon className="w-5 h-5" /> Add Photo or Video
                            </button>
                         )}
                      </section>

                      {/* 4. Automations */}
                      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                         <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-blue-800">
                               <Zap className="w-4 h-4 fill-current" />
                               <span className="font-bold text-sm uppercase tracking-wide">Automation</span>
                            </div>
                         </div>
                         
                         <div className="flex items-center justify-between bg-white/60 p-3 rounded-xl">
                            <div>
                               <p className="font-semibold text-gray-900 text-sm">Auto-Reply Engagement</p>
                               <p className="text-xs text-gray-500">Bot will like & reply to first 5 comments</p>
                            </div>
                            <button 
                               onClick={() => setAutoEngage(!autoEngage)}
                               className={`w-11 h-6 rounded-full p-1 transition-colors ${autoEngage ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                               <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${autoEngage ? 'translate-x-5' : ''}`} />
                            </button>
                         </div>
                      </section>
                   </div>

                   {/* Right Column: Live Preview */}
                   <div className="hidden lg:flex w-[400px] bg-slate-100 p-6 flex-col border-l border-gray-200">
                      <div className="flex items-center justify-between mb-6">
                         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Preview</h3>
                         
                         {/* Platform Switcher for Preview */}
                         {selectedPlatforms.length > 1 && (
                            <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm">
                               {selectedPlatforms.map(p => (
                                  <button
                                     key={p}
                                     onClick={() => setPreviewPlatform(p)}
                                     className={`p-1.5 rounded-md transition-all ${previewPlatform === p ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                                  >
                                     <PlatformIcon platform={p} size={14} white={previewPlatform === p} />
                                  </button>
                               ))}
                            </div>
                         )}
                      </div>

                      {/* Device Shell */}
                      <div className="flex-1 bg-white rounded-3xl shadow-xl border border-white/50 overflow-hidden flex flex-col">
                         {/* App Header Bar (Mock) */}
                         <div className="h-12 border-b border-gray-50 flex items-center justify-center relative bg-white/80 backdrop-blur-sm">
                            <PlatformIcon platform={previewPlatform} size={20} />
                            <div className="absolute right-4 w-6 h-6 rounded-full bg-slate-100"></div>
                         </div>

                         {/* Post Content */}
                         <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
                            <div className="flex gap-3">
                               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 shrink-0"></div>
                               <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                     <span className="font-bold text-sm text-slate-900 truncate">Your Brand</span>
                                     <span className="text-xs text-slate-500">@brand • Now</span>
                                  </div>
                                  <p className="text-sm text-slate-800 whitespace-pre-wrap mb-3 leading-relaxed">
                                     {newPostContent || <span className="text-slate-300 italic">Start typing to preview...</span>}
                                  </p>
                                  
                                  {selectedMedia && (
                                     <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 mb-3">
                                        {selectedMedia.type === 'image' ? (
                                           <img src={selectedMedia.url} className="w-full object-cover max-h-60" alt="Preview" />
                                        ) : (
                                           <div className="w-full h-40 bg-black flex items-center justify-center text-white">
                                              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                                 <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                                              </div>
                                           </div>
                                        )}
                                     </div>
                                  )}

                                  {/* Engagement Mock */}
                                  <div className="flex items-center justify-between text-slate-400 mt-2 pr-4">
                                     <MessageCircle className="w-4 h-4" />
                                     <Zap className="w-4 h-4" />
                                     <Heart className="w-4 h-4" />
                                     <Share className="w-4 h-4" />
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="mt-4 text-center">
                         <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                            Preview mode • Actual display may vary slightly by device.
                         </p>
                      </div>
                   </div>
                </div>
              )}

              {/* Action Bar */}
              {editingPost?.status !== PostStatus.Published && (
                 <div className="px-8 py-5 bg-white border-t border-gray-100 flex justify-between items-center sticky bottom-0 z-20">
                    {editingPost ? (
                       <button 
                          onClick={handleDeleteFromModal}
                          className="text-red-500 hover:text-red-700 font-bold text-sm px-4 py-2 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                          type="button"
                       >
                          <Trash2 className="w-4 h-4" /> Delete Post
                       </button>
                    ) : (
                       <div></div>
                    )}
                    <div className="flex gap-3">
                        <button 
                           onClick={() => setIsModalOpen(false)}
                           className="px-6 py-3 rounded-full font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                           type="button"
                        >
                           Cancel
                        </button>
                        <button 
                           onClick={handleSavePost}
                           disabled={(!newPostContent && !selectedMedia) || isOverLimit}
                           className="px-8 py-3 bg-black text-white rounded-full font-bold shadow-xl shadow-black/10 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative"
                           type="button"
                        >
                           {editingPost ? 'Update Post' : 'Schedule'}
                           {userSettings?.demoMode && (
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                 Demo Mode: Will simulate post
                              </div>
                           )}
                        </button>
                    </div>
                 </div>
              )}

           </div>
        </div>
      )}
      
      <MediaPicker isOpen={isMediaPickerOpen} onClose={() => setIsMediaPickerOpen(false)} onSelect={setSelectedMedia} />
    </div>
  );
};