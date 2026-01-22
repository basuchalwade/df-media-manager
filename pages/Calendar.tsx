
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, 
  Eye, Filter, LayoutList, Grid3X3,
  Globe, Zap, CheckCircle2, RotateCcw, AlertTriangle, Archive, FileEdit, Check, Split,
  User, Bot, Clock, CalendarDays, MoreHorizontal, ArrowRight, Trash2, StopCircle, Layers, X, AlertCircle
} from 'lucide-react';
import { store } from '../services/mockStore';
import { Post, Platform, PostStatus, PageProps, BotType } from '../types';
import { PlatformIcon } from '../components/PlatformIcon';
import { validatePost } from '../services/validationService';

// --- Constants & Helpers ---

const TIMEZONES = [
  { label: 'New York (EST)', value: 'America/New_York' },
  { label: 'Los Angeles (PST)', value: 'America/Los_Angeles' },
  { label: 'London (GMT)', value: 'Europe/London' },
  { label: 'India (IST)', value: 'Asia/Kolkata' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Sydney (AEDT)', value: 'Australia/Sydney' },
];

const getStatusStyle = (status: PostStatus, author?: string) => {
  switch (status) {
    case PostStatus.Published: return 'bg-green-100 text-green-700 border-green-200';
    case PostStatus.Scheduled: return 'bg-blue-100 text-blue-700 border-blue-200';
    case PostStatus.Approved: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case PostStatus.NeedsReview: return 'bg-amber-100 text-amber-700 border-amber-200';
    case PostStatus.Draft: 
        return author === 'User' 
            ? 'bg-gray-100 text-gray-600 border-gray-200' // Human Draft
            : 'bg-purple-50 text-purple-600 border-purple-100'; // Bot Draft (Active)
    case PostStatus.Failed: return 'bg-red-100 text-red-700 border-red-200';
    case PostStatus.Archived: return 'bg-slate-100 text-slate-500 border-slate-200 dashed-border';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getStatusLabel = (status: PostStatus, author?: string) => {
    if (status === PostStatus.Draft) {
        return author === 'User' ? 'Draft' : 'Bot Draft';
    }
    return status;
}

const isPastDate = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

// Simulate AI Best Time Suggestion
const isBestTime = (day: number) => {
  return day % 3 === 0 || day % 7 === 0; // Mock logic
};

// --- Validation Helper ---
const getPostValidationState = (post: Post) => {
    // Skip validation for published/archived as they are historical
    if (post.status === PostStatus.Published || post.status === PostStatus.Archived) return null;

    // Check date only if scheduled
    const checkDate = post.status === PostStatus.Scheduled ? new Date(post.scheduledFor) : undefined;

    const result = validatePost(
        post.content,
        post.platforms,
        post.mediaUrl ? { 
            id: 'mock', 
            name: 'media', 
            type: post.mediaType || 'image', 
            url: post.mediaUrl, 
            size: 0, 
            createdAt: '' 
        } : null,
        post.isCarousel,
        post.title,
        checkDate
    );

    if (!result.isValid) return { isError: true, message: result.errors[0] };
    if (result.warnings.length > 0) return { isError: false, message: result.warnings[0] };
    return null;
};

export const Calendar: React.FC<PageProps> = ({ onNavigate, params }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Filter & View State
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<PostStatus | 'All'>('All');
  const [filterAuthor, setFilterAuthor] = useState<string | 'All'>('All');
  const [viewMode, setViewMode] = useState<'Month' | 'Agenda'>('Month');
  
  // Selection & Bulk Actions
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());
  const [isBulkActionProcessing, setIsBulkActionProcessing] = useState(false);
  const [isAssignMenuOpen, setIsAssignMenuOpen] = useState(false);
  const bulkDateInputRef = useRef<HTMLInputElement>(null);
  
  // Timezone - Auto detect system default
  const systemTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [selectedTimezone, setSelectedTimezone] = useState(systemTz);

  // Capacity Limits
  const [dailyLimit, setDailyLimit] = useState(3); // Default limit

  // Drag & Drop State
  const [draggedPost, setDraggedPost] = useState<Post | null>(null);

  useEffect(() => {
    loadPosts();
    
    // Fetch Bot Config to get Calendar Capacity
    store.getBots().then(bots => {
       const creatorBot = bots.find(b => b.type === BotType.Creator);
       if (creatorBot?.config?.calendarConfig?.maxPostsPerDay) {
          setDailyLimit(creatorBot.config.calendarConfig.maxPostsPerDay);
       }
    });

    // Handle Navigation Params (e.g. Filter by Bot or Date)
    if (params) {
      if (params.filterAuthor) {
        setFilterAuthor(params.filterAuthor);
      }
      if (params.date) {
        const d = new Date(params.date);
        if (!isNaN(d.getTime())) {
            setSelectedDate(d);
            setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1)); // Switch month view to target
        }
      }
    }
  }, [params]);

  const loadPosts = async () => {
    const fetchedPosts = await store.getPosts();
    setPosts(fetchedPosts);
  };

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCreateEvent = () => {
    let dateToUse = selectedDate;
    if (isPastDate(selectedDate)) {
      dateToUse = new Date();
    }
    // Deep Sync: Pass all relevant context to Studio
    onNavigate('creator', { 
      date: dateToUse.toISOString(),
      timezone: selectedTimezone,
      platform: filterPlatform !== 'All' ? filterPlatform : undefined
    });
  };

  const handleEditPost = (post: Post) => {
    onNavigate('creator', { postId: post.id });
  };

  // --- Selection Logic ---
  const toggleSelection = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    const newSet = new Set(selectedPostIds);
    if (newSet.has(postId)) {
      newSet.delete(postId);
    } else {
      newSet.add(postId);
    }
    setSelectedPostIds(newSet);
  };

  const clearSelection = () => {
    setSelectedPostIds(new Set());
    setIsAssignMenuOpen(false);
  };

  const selectAllBots = () => {
    const botPostIds = posts
      .filter(p => p.author !== 'User' && p.status !== PostStatus.Published)
      .map(p => p.id);
    setSelectedPostIds(new Set(botPostIds));
  };

  // --- Bulk Actions ---
  const performBulkAction = async (action: (post: Post) => Post) => {
    if (selectedPostIds.size === 0) return;
    setIsBulkActionProcessing(true);
    
    // Create updates based on current posts state
    const updates = posts
      .filter(p => selectedPostIds.has(p.id))
      .map(p => action(p));

    for (const post of updates) {
      await store.updatePost(post);
    }

    await loadPosts();
    setIsBulkActionProcessing(false);
    clearSelection();
  };

  const handleBulkReschedule = (dateStr: string) => {
    if (!dateStr) return;
    
    // Explicitly parse parts to avoid UTC/Local timezone shifts
    const [year, month, day] = dateStr.split('-').map(Number);

    performBulkAction(post => {
      const original = new Date(post.scheduledFor);
      
      // Construct local date from input
      const newDate = new Date(year, month - 1, day);
      
      // Preserve original time
      newDate.setHours(original.getHours(), original.getMinutes());
      
      return { ...post, scheduledFor: newDate.toISOString(), status: PostStatus.Scheduled };
    });

    // Reset input value to allow re-selection of same date if needed
    if (bulkDateInputRef.current) bulkDateInputRef.current.value = '';
  };

  const handleBulkMoveWeek = () => {
    performBulkAction(post => {
      const d = new Date(post.scheduledFor);
      d.setDate(d.getDate() + 7);
      return { ...post, scheduledFor: d.toISOString(), status: PostStatus.Scheduled };
    });
  };

  const handleBulkPause = () => {
    if(!confirm("Revert selected posts to Draft status? This will stop them from publishing.")) return;
    performBulkAction(post => ({ ...post, status: PostStatus.Draft }));
  };
  
  const handleBulkApprove = () => {
    performBulkAction(post => ({ ...post, status: PostStatus.Approved }));
  };

  const handleBulkAssignBot = (botType: BotType | 'User') => {
    performBulkAction(post => ({ ...post, author: botType }));
    setIsAssignMenuOpen(false);
  };

  const handleBulkDelete = async () => {
    if (selectedPostIds.size === 0) return;
    if (!window.confirm(`Permanently delete ${selectedPostIds.size} posts?`)) return;
    
    setIsBulkActionProcessing(true);
    const ids = Array.from(selectedPostIds);
    for (const id of ids) {
        await store.deletePost(id);
    }
    await loadPosts();
    clearSelection();
    setIsBulkActionProcessing(false);
  };

  const handleRevertToDraft = async (e: React.MouseEvent, post: Post) => {
    e.stopPropagation();
    if(window.confirm('Cancel scheduling and move to Drafts?')) {
        const updated = { ...post, status: PostStatus.Draft };
        await store.updatePost(updated);
        await loadPosts();
    }
  };

  const handleArchive = async (e: React.MouseEvent, post: Post) => {
    e.stopPropagation();
    if(window.confirm('Archive this post? It will be hidden from main views.')) {
        const updated = { ...post, status: PostStatus.Archived };
        await store.updatePost(updated);
        await loadPosts();
    }
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
    e.stopPropagation();
    if (!draggedPost) return;

    if (isPastDate(date) && (draggedPost.status === PostStatus.Scheduled || draggedPost.status === PostStatus.Published)) {
       alert("Cannot schedule posts in the past.");
       setDraggedPost(null);
       return;
    }

    const originalDate = new Date(draggedPost.scheduledFor);
    const newDate = new Date(date);
    // Auto-update: Keep original time
    newDate.setHours(originalDate.getHours(), originalDate.getMinutes(), 0, 0);

    const updatedPost = {
      ...draggedPost,
      scheduledFor: newDate.toISOString(),
      status: PostStatus.Scheduled // Auto-switch to scheduled if it was Draft
    };

    // Optimistic Update
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    await store.updatePost(updatedPost);
    setDraggedPost(null);
    await loadPosts();
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

  const rawPostsForDate = getPostsForDate(selectedDate);
  
  // Apply all filters
  const filteredPosts = rawPostsForDate.filter(p => {
    if (filterPlatform !== 'All' && !p.platforms.includes(filterPlatform)) return false;
    if (filterStatus !== 'All' && p.status !== filterStatus) return false;
    if (filterAuthor !== 'All' && p.author !== filterAuthor) return false;
    return true;
  }).sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());

  const getAgendaPosts = () => {
    return posts
      .filter(p => new Date(p.scheduledFor) >= new Date()) // Future only
      .filter(p => filterPlatform === 'All' || p.platforms.includes(filterPlatform))
      .filter(p => filterStatus === 'All' || p.status === filterStatus)
      .filter(p => filterAuthor === 'All' || p.author === filterAuthor)
      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
      .slice(0, 50); // Increased limit for bulk operations utility
  };

  const agendaPosts = getAgendaPosts();

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-700 relative">
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
                <option value={systemTz}>System ({systemTz})</option>
                {TIMEZONES.filter(t => t.value !== systemTz).map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
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
        <div className="flex-1 bg-white rounded-[32px] border border-black/5 shadow-sm p-6 flex flex-col overflow-hidden relative">
          
          {/* Top Bulk Action Bar (Replaces Headers when active) */}
          {selectedPostIds.size > 0 ? (
             <div className="w-full bg-[#1d1d1f] text-white p-3 rounded-2xl shadow-xl flex items-center justify-between mb-4 animate-in slide-in-from-top-2 z-30">
                <div className="flex items-center gap-4 pl-2">
                   <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{selectedPostIds.size} Selected</span>
                      <span className="text-[10px] text-gray-400 font-medium">Bulk Actions</span>
                   </div>
                   <div className="h-8 w-px bg-gray-700"></div>
                   <button onClick={clearSelection} className="text-xs font-bold text-gray-400 hover:text-white transition-colors">
                      Deselect All
                   </button>
                </div>
                
                <div className="flex items-center gap-2">
                   {/* Approve */}
                   <button onClick={handleBulkApprove} className="flex flex-col items-center gap-1 p-2 hover:bg-white/10 rounded-lg min-w-[60px] transition-colors" title="Approve Selected">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Approve</span>
                   </button>
                   
                   {/* Reschedule */}
                   <div className="relative">
                       <button className="flex flex-col items-center gap-1 p-2 hover:bg-white/10 rounded-lg min-w-[60px] transition-colors" title="Change Date">
                          <CalendarDays className="w-5 h-5 text-blue-400" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Move</span>
                       </button>
                       <input 
                          type="date" 
                          ref={bulkDateInputRef}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => handleBulkReschedule(e.target.value)}
                       />
                   </div>

                   {/* Assign Bot */}
                   <div className="relative">
                       <button 
                          onClick={() => setIsAssignMenuOpen(!isAssignMenuOpen)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg min-w-[60px] transition-colors ${isAssignMenuOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
                        >
                          <Bot className="w-5 h-5 text-purple-400" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Assign</span>
                       </button>
                       {isAssignMenuOpen && (
                         <>
                           <div className="fixed inset-0 z-10" onClick={() => setIsAssignMenuOpen(false)} />
                           <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-1 w-48 z-20 animate-in fade-in zoom-in-95 duration-100">
                               <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1 flex justify-between items-center">
                                  Assign Author
                                  <X className="w-3 h-3 cursor-pointer" onClick={() => setIsAssignMenuOpen(false)} />
                               </div>
                               {Object.values(BotType).map(bot => (
                                  <button 
                                    key={bot} 
                                    onClick={() => handleBulkAssignBot(bot)}
                                    className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg flex items-center gap-2"
                                  >
                                     <Bot className="w-3 h-3" /> {bot}
                                  </button>
                               ))}
                               <button 
                                    onClick={() => handleBulkAssignBot('User' as any)}
                                    className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                                  >
                                     <User className="w-3 h-3" /> User (Manual)
                              </button>
                           </div>
                         </>
                       )}
                   </div>

                   <div className="h-8 w-px bg-gray-700 mx-2"></div>

                   {/* Delete */}
                   <button onClick={handleBulkDelete} className="flex flex-col items-center gap-1 p-2 hover:bg-red-500/20 rounded-lg group min-w-[60px] transition-colors" title="Delete Selected">
                      <Trash2 className="w-5 h-5 text-red-500 group-hover:text-red-400" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-red-500 group-hover:text-red-400">Delete</span>
                   </button>
                </div>
             </div>
          ) : (
             // Standard Headers
             <>
                {viewMode === 'Month' ? (
                  <div className="flex items-center justify-between mb-6">
                     <h2 className="text-xl font-bold text-gray-900">
                       {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                     </h2>
                     <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                       <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-full transition-shadow hover:shadow-sm"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
                       <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-full transition-shadow hover:shadow-sm"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
                     </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-800">Upcoming Agenda</h3>
                      <div className="text-xs text-gray-500 font-medium">{agendaPosts.length} posts scheduled</div>
                  </div>
                )}
             </>
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
                    
                    // Capacity Calculation (Active Scheduled/Published/Drafts, ignore Archived/Failed)
                    const activeCount = dayPosts.filter(p => p.status !== PostStatus.Archived && p.status !== PostStatus.Failed).length;
                    const isFull = activeCount >= dailyLimit;
                    const isOverLimit = activeCount > dailyLimit;

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
                            : 'bg-white text-gray-700 hover:border-gray-100'}
                          ${isToday && !isSelected ? 'ring-2 ring-blue-500 ring-offset-1 z-0' : ''}
                          ${isSuggested && !isSelected && !isPast ? 'shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)] border-blue-100' : ''}
                          ${!isSelected && isFull && !isOverLimit ? 'border-orange-200 bg-orange-50/30' : ''}
                          ${!isSelected && isOverLimit ? 'border-red-200 bg-red-50/30' : ''}
                          ${!isSelected && !isFull && !isOverLimit && !isSuggested ? 'border-transparent' : ''}
                        `}
                      >
                        <div className="flex justify-between items-start">
                           <span className={`text-sm font-bold ${isSelected ? 'text-white' : isPast ? 'text-gray-400' : 'text-gray-900'}`}>{day}</span>
                           <div className="flex gap-0.5">
                              {/* Warning Dot for Over Limit */}
                              {isOverLimit && !isSelected && (
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title="Over Limit"></div>
                              )}
                              {dayPosts.length > 0 && dayPosts.some(p => p.status === PostStatus.NeedsReview) && (
                                <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-yellow-300' : 'bg-amber-500'}`} title="Needs Review"></div>
                              )}
                              {isSuggested && !isSelected && !isPast && (
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" title="AI Suggested Day"></div>
                              )}
                           </div>
                           
                           {/* Post Capacity Counter */}
                           {!isPast && (
                               <div className={`
                                  absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full border
                                  ${isSelected 
                                    ? 'bg-white/20 text-white border-white/20' 
                                    : isOverLimit 
                                        ? 'bg-red-100 text-red-600 border-red-200'
                                        : isFull 
                                            ? 'bg-orange-100 text-orange-600 border-orange-200'
                                            : 'bg-gray-100 text-gray-400 border-gray-200'}
                               `}>
                                  {activeCount}/{dailyLimit}
                               </div>
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
                           {dayPosts.slice(0, 6).map((p, idx) => {
                              const validation = getPostValidationState(p);
                              return (
                              <div 
                                key={idx} 
                                className="relative group/icon cursor-grab active:cursor-grabbing" 
                                onClick={(e) => toggleSelection(e, p.id)}
                                draggable={p.status !== PostStatus.Published && p.status !== PostStatus.Archived}
                                onDragStart={(e) => {
                                    e.stopPropagation();
                                    handleDragStart(e, p);
                                }}
                              >
                                {validation && (
                                    <div 
                                        className={`absolute -top-1 -left-1 z-20 rounded-full bg-white border border-white ${validation.isError ? 'text-red-500' : 'text-yellow-500'}`} 
                                        title={validation.message}
                                    >
                                        <AlertCircle className="w-3 h-3 fill-white" />
                                    </div>
                                )}
                                <PlatformIcon 
                                  platform={p.platforms[0]} 
                                  size={10} 
                                  white={isSelected} 
                                  className={`${isSelected ? 'opacity-90' : ''}`}
                                />
                                {selectedPostIds.has(p.id) && (
                                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full border border-white"></div>
                                )}
                              </div>
                           )})}
                        </div>
                      </div>
                    );
                 })}
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pb-24">
               {agendaPosts.length === 0 ? (
                  <div className="py-20 text-center text-gray-400">
                     <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                     <p>No upcoming posts found for current filters.</p>
                  </div>
               ) : (
               agendaPosts.map(post => {
                 const isSelected = selectedPostIds.has(post.id);
                 const statusStyle = getStatusStyle(post.status, post.author);
                 const isBot = post.author !== 'User';
                 const validation = getPostValidationState(post);

                 return (
                 <div 
                    key={post.id} 
                    className={`flex gap-4 p-3 rounded-xl border transition-all group cursor-pointer ${
                        isSelected ? 'bg-blue-50/50 border-blue-200 shadow-sm' : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'
                    }`}
                    onClick={() => handleEditPost(post)}
                    draggable={post.status !== PostStatus.Published && post.status !== PostStatus.Archived}
                    onDragStart={(e) => handleDragStart(e, post)}
                 >
                    {/* Selection Checkbox */}
                    <div className="flex items-center justify-center pl-1 cursor-pointer" onClick={(e) => toggleSelection(e, post.id)}>
                       <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-transparent hover:border-blue-400'
                       }`}>
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                       </div>
                    </div>

                    {/* Date Block */}
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-gray-50 rounded-lg border border-gray-200 shrink-0">
                       <span className="text-[10px] font-bold text-gray-500 uppercase">{new Date(post.scheduledFor).toLocaleDateString('en-US', { month: 'short' })}</span>
                       <span className="text-lg font-bold text-gray-900">{new Date(post.scheduledFor).getDate()}</span>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                       <div className="flex items-center gap-2 mb-1.5">
                          {/* Time */}
                          <div className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                             <Clock className="w-3 h-3" />
                             {new Date(post.scheduledFor).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          
                          {/* Platforms */}
                          <div className="flex -space-x-1">
                             {post.platforms.map(p => (
                               <div key={p} className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm z-10 relative">
                                  <PlatformIcon platform={p} size={10} />
                               </div>
                             ))}
                          </div>

                          {/* Status Badge */}
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusStyle(post.status, post.author)}`}>
                             {getStatusLabel(post.status, post.author)}
                          </span>
                          
                          {/* Validation Badge for Agenda View */}
                          {validation && (
                             <span 
                                className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${validation.isError ? 'bg-red-50 text-red-600 border-red-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'}`}
                                title={validation.message}
                             >
                                <AlertCircle className="w-3 h-3" />
                                {validation.isError ? 'Error' : 'Warning'}
                             </span>
                          )}

                          {/* Bot/User Icon */}
                          {isBot ? (
                             <span title="Bot Generated" className="flex items-center">
                               <Bot className="w-3.5 h-3.5 text-purple-500 ml-1" />
                             </span>
                          ) : (
                             <span title="Manually Created" className="flex items-center">
                               <User className="w-3.5 h-3.5 text-gray-400 ml-1" />
                             </span>
                          )}
                       </div>
                       
                       <p className="text-sm text-gray-700 font-medium truncate pr-4">{post.content}</p>
                    </div>

                    <div className="flex items-center px-2">
                       <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                 </div>
               )}))}
            </div>
          )}
        </div>

        {/* Right: Day View / Detail Sidebar */}
        <div 
            className="w-full lg:w-[400px] bg-[#F5F5F7]/80 backdrop-blur-xl rounded-[32px] border border-white/60 flex flex-col h-full overflow-hidden shadow-xl shadow-gray-200/50"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, selectedDate)}
        >
           {/* Sidebar Timeline Content */}
           <div className="p-6 border-b border-gray-200/50 bg-white/60 sticky top-0 z-20 backdrop-blur-md">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Selected Date</span>
                 </div>
                 {/* Smart Select Action */}
                 <button 
                    onClick={selectAllBots}
                    className="text-[10px] font-bold text-purple-600 hover:bg-purple-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                 >
                    <Bot className="w-3 h-3" /> Select All Bots
                 </button>
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
                 
                 {/* Status & Author Filter Row */}
                 <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar items-center pl-6">
                    {/* Bot Filter Toggle */}
                    <button 
                        onClick={() => setFilterAuthor(filterAuthor === 'All' ? BotType.Creator : 'All')}
                        className={`
                            px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap flex items-center gap-1
                            ${filterAuthor !== 'All' 
                                ? 'bg-orange-500 text-white border-orange-500 shadow-md' 
                                : 'bg-white text-slate-500 border-gray-100 hover:bg-gray-50'}
                        `}
                    >
                        <Zap className="w-3 h-3" /> Bot Created
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    {['All', ...Object.values(PostStatus)].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status as PostStatus | 'All')}
                            className={`
                                px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap
                                ${filterStatus === status 
                                    ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                                    : 'bg-white text-slate-500 border-gray-100 hover:bg-gray-50'}
                            `}
                        >
                            {status}
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
                    <button onClick={handleCreateEvent} className="mt-4 text-blue-600 font-bold text-xs hover:underline">
                       Create one for this day
                    </button>
                 </div>
              ) : (
                <>
                <div className="absolute left-9 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent z-0 hidden lg:block" />
                {filteredPosts.map((post, idx) => {
                  const label = getStatusLabel(post.status, post.author);
                  const validation = getPostValidationState(post);

                  return (
                  <div 
                     key={post.id} 
                     className="relative z-10 animate-in slide-in-from-right-4 duration-500" 
                     draggable={post.status !== PostStatus.Published && post.status !== PostStatus.Archived}
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
                        <div className={`flex-1 bg-white rounded-2xl shadow-sm border p-3 transition-colors ${post.author === BotType.Creator ? 'border-purple-50 bg-purple-50/20' : 'border-gray-100 hover:border-blue-100'}`}>
                           <div className="flex justify-between items-center mb-2">
                              <div className="flex -space-x-2 pl-1">
                                 {post.platforms.map((p, i) => (
                                    <div key={p} className="w-6 h-6 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center z-10 relative" style={{ zIndex: 10 - i }}>
                                       <PlatformIcon platform={p} size={12} />
                                    </div>
                                 ))}
                              </div>
                              <div className="flex gap-1 items-center">
                                {validation && (
                                   <div 
                                      className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${validation.isError ? 'bg-red-50 text-red-600 border-red-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'}`}
                                      title={validation.message}
                                   >
                                      <AlertCircle className="w-3 h-3" /> Fix
                                   </div>
                                )}
                                {post.author === BotType.Creator && (
                                    <div className="bg-purple-100 text-purple-700 p-1 rounded-full" title="Drafted by Creator Bot">
                                        <Zap className="w-3 h-3" />
                                    </div>
                                )}
                                {post.variants && post.variants.length > 1 && (
                                    <div className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded flex items-center gap-1 border border-purple-100" title="Has A/B Variants">
                                        <Split className="w-3 h-3" />
                                    </div>
                                )}
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusStyle(post.status, post.author)}`}>{label}</span>
                              </div>
                           </div>
                           <p className={`text-sm font-medium line-clamp-2 ${post.status === PostStatus.Archived ? 'text-gray-400' : 'text-gray-700'}`}>{post.content}</p>
                           
                           {/* Quick Actions on Hover */}
                           <div className="mt-2 pt-2 border-t border-gray-100 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {(post.status === PostStatus.Scheduled || post.status === PostStatus.NeedsReview) && (
                                  <button 
                                    onClick={(e) => handleRevertToDraft(e, post)}
                                    className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1"
                                    title="Move to Drafts"
                                  >
                                    <RotateCcw className="w-3 h-3" /> Draft
                                  </button>
                              )}
                              {post.status !== PostStatus.Archived && (
                                  <button 
                                    onClick={(e) => handleArchive(e, post)}
                                    className="text-xs font-bold text-gray-400 hover:text-slate-600 flex items-center gap-1"
                                    title="Archive"
                                  >
                                    <Archive className="w-3 h-3" />
                                  </button>
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
    </div>
  );
};
