
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, 
  Eye, LayoutList, Grid3X3,
  Globe, Zap, CheckCircle2, RotateCcw, AlertTriangle, Archive, FileEdit, Check, 
  User, Bot, Clock, CalendarDays, Trash2, X, Search, Filter, 
  ArrowRight, Sparkles, AlertOctagon, MoreHorizontal, CalendarRange, Copy, Loader2
} from 'lucide-react';
import { store } from '../services/mockStore';
import { Post, Platform, PostStatus, PageProps, BotType } from '../types';
import { PlatformIcon } from '../components/PlatformIcon';
import { usePlatforms } from '../hooks/usePlatforms';

// --- Visual Config ---

const STATUS_CONFIG: Record<PostStatus, { icon: any, color: string, bg: string, border: string, label: string }> = {
  [PostStatus.Draft]: { icon: FileEdit, color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200', label: 'Draft' },
  [PostStatus.NeedsReview]: { icon: Eye, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Review' },
  [PostStatus.Approved]: { icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', label: 'Approved' },
  [PostStatus.Scheduled]: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Scheduled' },
  [PostStatus.Processing]: { icon: Loader2, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Processing' },
  [PostStatus.Published]: { icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Published' },
  [PostStatus.Failed]: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Failed' },
  [PostStatus.Archived]: { icon: Archive, color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200', label: 'Archived' },
};

const TIME_PRESETS = [
    { label: 'Today', days: 0 },
    { label: 'Tomorrow', days: 1 },
    { label: 'Next 7 Days', days: 7 },
];

const isPastDate = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

// --- Component ---

export const Calendar: React.FC<PageProps> = ({ onNavigate, params }) => {
  // Use Registry Hook
  const { platforms, getPlatform } = usePlatforms();

  // Core State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  
  // View State
  const [viewMode, setViewMode] = useState<'Month' | 'Agenda'>('Month');
  
  // Filter State
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<PostStatus[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showIssuesOnly, setShowIssuesOnly] = useState(false);

  // Bulk Selection
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Config
  const [dailyLimit, setDailyLimit] = useState(3);
  const systemTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Load Data
  useEffect(() => {
    loadPosts();
    store.getBots().then(bots => {
       const creatorBot = bots.find(b => b.type === BotType.Creator);
       if (creatorBot?.config?.calendarConfig?.maxPostsPerDay) {
          setDailyLimit(creatorBot.config.calendarConfig.maxPostsPerDay);
       }
    });

    if (params) {
      if (params.date) {
        const d = new Date(params.date);
        if (!isNaN(d.getTime())) {
            setSelectedDate(d);
            setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
        }
      }
      if (params.view) setViewMode(params.view);
    }
  }, [params]);

  const loadPosts = async () => setPosts(await store.getPosts());

  // --- Handlers ---

  const handleTimeJump = (daysOffset: number) => {
      const target = new Date();
      target.setDate(target.getDate() + daysOffset);
      setSelectedDate(target);
      setCurrentDate(new Date(target.getFullYear(), target.getMonth(), 1));
      
      if (daysOffset > 1) {
          // If jumping to a range (like next 7 days), Agenda view is usually better
          setViewMode('Agenda');
      }
  };

  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(p) ? prev.filter(i => i !== p) : [...prev, p]
    );
  };

  const toggleStatus = (s: PostStatus) => {
    setShowIssuesOnly(false); // Disable quick filter if manual selection
    setSelectedStatuses(prev => 
      prev.includes(s) ? prev.filter(i => i !== s) : [...prev, s]
    );
  };

  const toggleIssuesOnly = () => {
      if (showIssuesOnly) {
          setShowIssuesOnly(false);
          setSelectedStatuses([]);
      } else {
          setShowIssuesOnly(true);
          setSelectedStatuses([PostStatus.Failed, PostStatus.NeedsReview]);
      }
  };

  const clearFilters = () => {
    setSelectedPlatforms([]);
    setSelectedStatuses([]);
    setSearchQuery('');
    setShowIssuesOnly(false);
  };

  const toggleSelection = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    const newSet = new Set(selectedPostIds);
    if (newSet.has(postId)) newSet.delete(postId);
    else newSet.add(postId);
    setSelectedPostIds(newSet);
  };

  const performBulkAction = async (actionType: 'Approve' | 'Draft' | 'Delete' | 'Archive' | 'MoveDay' | 'Duplicate') => {
      if (selectedPostIds.size === 0) return;
      if (actionType === 'Delete' && !confirm(`Delete ${selectedPostIds.size} posts?`)) return;

      setIsBulkProcessing(true);
      const updates = posts.filter(p => selectedPostIds.has(p.id));

      for (const post of updates) {
          let updated = { ...post };
          
          if (actionType === 'Approve') updated.status = PostStatus.Approved;
          if (actionType === 'Draft') updated.status = PostStatus.Draft;
          if (actionType === 'Archive') updated.status = PostStatus.Archived;
          if (actionType === 'MoveDay') {
              const d = new Date(post.scheduledFor);
              d.setDate(d.getDate() + 1);
              updated.scheduledFor = d.toISOString();
          }
          if (actionType === 'Duplicate') {
              await store.addPost({ 
                  ...post, 
                  id: Date.now().toString() + Math.random(), 
                  status: PostStatus.Draft,
                  title: post.title ? `${post.title} (Copy)` : undefined
              });
              continue; 
          }

          if (actionType === 'Delete') await store.deletePost(post.id);
          else await store.updatePost(updated);
      }

      await loadPosts();
      setIsBulkProcessing(false);
      setSelectedPostIds(new Set());
  };

  // --- Filtering Logic ---
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (selectedPlatforms.length > 0 && !post.platforms.some(p => selectedPlatforms.includes(p))) return false;
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(post.status)) return false;
      if (searchQuery) {
         const q = searchQuery.toLowerCase();
         return post.content.toLowerCase().includes(q) || post.platforms.some(p => p.toLowerCase().includes(q));
      }
      return true;
    }).sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
  }, [posts, selectedPlatforms, selectedStatuses, searchQuery]);

  // Grouping for Agenda
  const agendaGroups = useMemo(() => {
      const groups: Record<string, Post[]> = { 'Today': [], 'Tomorrow': [], 'This Week': [], 'Later': [], 'Past': [] };
      const today = new Date(); today.setHours(0,0,0,0);
      const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
      const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);

      filteredPosts.forEach(post => {
          const d = new Date(post.scheduledFor); d.setHours(0,0,0,0);
          if (d.getTime() < today.getTime()) groups['Past'].push(post);
          else if (d.getTime() === today.getTime()) groups['Today'].push(post);
          else if (d.getTime() === tomorrow.getTime()) groups['Tomorrow'].push(post);
          else if (d < nextWeek) groups['This Week'].push(post);
          else groups['Later'].push(post);
      });
      return groups;
  }, [filteredPosts]);

  // Selected Day Posts (Month View)
  const selectedDayPosts = filteredPosts.filter(p => {
      const d = new Date(p.scheduledFor);
      return d.toDateString() === selectedDate.toDateString();
  });

  // --- Render Helpers ---
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const activeFiltersCount = selectedPlatforms.length + selectedStatuses.length + (searchQuery ? 1 : 0);
  const isSelectedDatePast = isPastDate(selectedDate);

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500 pb-24 relative">
      
      {/* 1. Top Control Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Calendar</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 font-medium">
             <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>{systemTz.split('/').pop()?.replace('_', ' ')}</span>
             </div>
             <span>•</span>
             <span>{posts.length} Total Posts</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           {/* Time Jumps */}
           <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
              {TIME_PRESETS.map((preset) => (
                  <button 
                    key={preset.label}
                    onClick={() => handleTimeJump(preset.days)}
                    className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                  >
                    {preset.label}
                  </button>
              ))}
           </div>

           {/* View Toggle */}
           <div className="bg-white border border-gray-200 rounded-lg p-1 flex shadow-sm">
              <button 
                onClick={() => setViewMode('Month')} 
                className={`px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'Month' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}
              >
                <Grid3X3 className="w-3.5 h-3.5" /> Month
              </button>
              <button 
                onClick={() => setViewMode('Agenda')} 
                className={`px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'Agenda' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}
              >
                <LayoutList className="w-3.5 h-3.5" /> Agenda
              </button>
           </div>
           
           <button onClick={() => onNavigate('creator', { date: new Date().toISOString() })} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95">
              <Plus className="w-4 h-4" /> Create Post
           </button>
        </div>
      </div>

      {/* 2. Enhanced Filter Toolbar */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-4 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] flex flex-col gap-4 relative z-10 shrink-0">
         <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
             
             {/* Search */}
             <div className="relative w-full lg:w-64 shrink-0">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input 
                    type="text" 
                    placeholder="Search posts, tags..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-transparent focus:border-blue-500/20 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm font-medium transition-all"
                 />
             </div>

             <div className="h-8 w-px bg-gray-200 hidden lg:block"></div>

             {/* Platform Filters */}
             <div className="flex-1 flex flex-col gap-2 w-full overflow-hidden">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform</label>
                    {activeFiltersCount > 0 && (
                        <button onClick={clearFilters} className="text-[10px] font-bold text-red-500 hover:underline">Reset All</button>
                    )}
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {platforms.map(p => {
                        const isActive = selectedPlatforms.includes(p.id);
                        const brandStyle = p.ui.color + ' ' + p.ui.borderColor + ' border';
                        // If disabled (e.g. not connected), we might still want to show it as filter but grayed?
                        // Or hide it? Let's just grey out unconnected ones.
                        const isConnected = p.connected && p.enabled && !p.outage;
                        
                        return (
                            <button
                                key={p.id}
                                onClick={() => togglePlatform(p.id)}
                                className={`
                                    relative flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all whitespace-nowrap
                                    ${isActive 
                                      ? `${brandStyle} shadow-md` 
                                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'}
                                    ${!isConnected ? 'opacity-50 grayscale' : ''}
                                `}
                                title={p.name}
                            >
                                <PlatformIcon platform={p.id} size={14} white={isActive} />
                                <span className="hidden sm:inline">{p.name}</span>
                            </button>
                        );
                    })}
                </div>
             </div>

             <div className="h-8 w-px bg-gray-200 hidden lg:block"></div>

             {/* Status Filters */}
             <div className="flex-1 flex flex-col gap-2 w-full overflow-hidden">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {/* Issues Toggle */}
                    <button
                        onClick={toggleIssuesOnly}
                        className={`
                             flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap
                             ${showIssuesOnly ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200'}
                        `}
                    >
                        <AlertOctagon className="w-3.5 h-3.5" /> Only Issues
                    </button>

                    <div className="w-px h-6 bg-gray-200 mx-1"></div>

                    {Object.values(PostStatus).slice(0, 5).map(s => { // Show main ones
                        const isActive = selectedStatuses.includes(s);
                        const config = STATUS_CONFIG[s];
                        return (
                            <button
                                key={s}
                                onClick={() => toggleStatus(s)}
                                className={`
                                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap
                                    ${isActive 
                                        ? `${config.bg} ${config.color} ${config.border} ring-1 ring-black/5 shadow-sm` 
                                        : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:bg-slate-50'}
                                `}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-current' : 'bg-gray-300'}`}></div>
                                {config.label}
                            </button>
                        );
                    })}
                </div>
             </div>
         </div>
      </div>

      {/* 3. Main Views */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* === MONTH VIEW === */}
        {viewMode === 'Month' && (
            <>
                <div className="flex-1 bg-white rounded-[32px] border border-black/5 shadow-sm p-6 flex flex-col overflow-hidden relative">
                    {/* Navigation */}
                    <div className="flex items-center justify-between mb-6 shrink-0">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
                            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg">
                                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-1.5 hover:bg-white rounded-md transition-all shadow-sm text-gray-600"><ChevronLeft className="w-4 h-4" /></button>
                                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-1.5 hover:bg-white rounded-md transition-all shadow-sm text-gray-600"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <button onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }} className="text-xs font-bold text-blue-600 hover:underline">
                            Jump to Today
                        </button>
                    </div>

                    {/* Grid Header */}
                    <div className="grid grid-cols-7 mb-2 border-b border-gray-100 pb-2 shrink-0">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">{d}</div>
                        ))}
                    </div>
                    
                    {/* Grid Body */}
                    <div className="grid grid-cols-7 flex-1 auto-rows-fr gap-px bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 ring-4 ring-gray-50">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`pad-${i}`} className="bg-gray-50/50 h-full w-full" />
                        ))}
                        
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                            const isToday = new Date().toDateString() === date.toDateString();
                            const isSelected = selectedDate.toDateString() === date.toDateString();
                            const isPast = isPastDate(date);
                            
                            const dayPosts = filteredPosts.filter(p => new Date(p.scheduledFor).toDateString() === date.toDateString());
                            const activePosts = dayPosts.filter(p => p.status !== PostStatus.Failed && p.status !== PostStatus.Archived);
                            const hasIssues = dayPosts.some(p => p.status === PostStatus.Failed || p.status === PostStatus.NeedsReview);
                            const isFull = activePosts.length >= dailyLimit;

                            return (
                                <div
                                    key={day}
                                    onClick={() => setSelectedDate(date)}
                                    className={`
                                        relative bg-white p-2 flex flex-col justify-between transition-all duration-200 group cursor-pointer
                                        ${isSelected ? 'bg-blue-50/50 ring-inset ring-2 ring-blue-500 z-10' : 'hover:bg-gray-50'}
                                        ${isPast ? 'bg-gray-50/30' : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`
                                            text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-colors
                                            ${isToday ? 'bg-blue-600 text-white shadow-md' : isSelected ? 'text-blue-600' : isPast ? 'text-gray-400' : 'text-gray-700'}
                                        `}>
                                            {day}
                                        </span>
                                        {activePosts.length > 0 && (
                                            <div className={`
                                                text-[9px] font-bold px-1.5 py-0.5 rounded-full border
                                                ${isFull ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-gray-100 text-gray-500 border-gray-200'}
                                            `}>
                                                {activePosts.length}/{dailyLimit}
                                            </div>
                                        )}
                                    </div>

                                    {/* Issue Dot */}
                                    {hasIssues && (
                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></div>
                                    )}

                                    {/* Platform Indicators */}
                                    <div className="flex items-end justify-between mt-1">
                                        <div className="flex -space-x-1.5 overflow-hidden py-1 px-1">
                                            {activePosts.slice(0, 3).map((p, idx) => (
                                                <div key={p.id} className="w-5 h-5 rounded-full bg-white ring-1 ring-gray-100 flex items-center justify-center shadow-sm relative z-0">
                                                    <PlatformIcon platform={p.platforms[0]} size={11} />
                                                </div>
                                            ))}
                                            {activePosts.length > 3 && (
                                                <div className="w-5 h-5 rounded-full bg-gray-100 ring-1 ring-white flex items-center justify-center text-[8px] font-bold text-gray-500 z-0">
                                                    +{activePosts.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Sidebar Day Detail */}
                <div className="w-full lg:w-[360px] bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/60 flex flex-col h-full shadow-xl shadow-gray-200/50 overflow-hidden shrink-0">
                    <div className="p-5 border-b border-gray-100 bg-white/50 backdrop-blur-md z-20 flex justify-between items-end">
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                {selectedDate.toDateString() === new Date().toDateString() ? 'Today' : 'Selected Date'}
                            </span>
                            <h3 className="text-xl font-bold text-gray-900 leading-tight">
                                {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </h3>
                        </div>
                        <div className="text-right">
                             <div className="text-2xl font-bold text-blue-600 leading-none">{selectedDayPosts.length}</div>
                             <div className="text-[10px] font-bold text-gray-400 uppercase">Posts</div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-gray-50/50">
                        {selectedDayPosts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                    <Sparkles className="w-8 h-8 text-blue-300" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900">
                                   {isSelectedDatePast ? 'No Past Activity' : 'No Content Scheduled'}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 mb-4 max-w-[200px]">
                                    {isSelectedDatePast 
                                      ? "No posts were scheduled for this date." 
                                      : "This day is clear. Use the button below to add a new post."}
                                </p>
                                {!isSelectedDatePast && (
                                    <button 
                                        onClick={() => onNavigate('creator', { date: selectedDate.toISOString() })}
                                        className="px-4 py-2 bg-black text-white rounded-lg text-xs font-bold hover:scale-105 transition-transform"
                                    >
                                        Create Post
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {selectedDayPosts.map(post => (
                                    <PostListItem 
                                        key={post.id} 
                                        post={post} 
                                        isSelected={selectedPostIds.has(post.id)}
                                        onToggleSelect={(e) => toggleSelection(e, post.id)}
                                        onClick={() => onNavigate('creator', { postId: post.id })}
                                    />
                                ))}
                                {filteredPosts.length > selectedDayPosts.length && selectedDayPosts.length === 0 && (
                                    <div className="text-center p-4 text-xs text-gray-400">
                                        Posts are hidden by current filters.
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </>
        )}

        {/* === AGENDA VIEW === */}
        {viewMode === 'Agenda' && (
            <div className="flex-1 bg-white/50 backdrop-blur-md rounded-[32px] border border-white/60 shadow-sm p-0 overflow-hidden flex flex-col relative">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {Object.entries(agendaGroups).map(([groupName, groupPosts]: [string, Post[]]) => {
                        if (groupPosts.length === 0) return null;
                        return (
                            <div key={groupName} className="mb-8 animate-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-center gap-4 mb-4 sticky top-0 bg-[#F5F5F7]/95 backdrop-blur-md py-3 z-10 px-2 border-b border-gray-200/50">
                                    <div className={`p-1.5 rounded-lg ${groupName === 'Today' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                                        <CalendarIcon className="w-4 h-4" />
                                    </div>
                                    <h3 className={`text-lg font-bold ${groupName === 'Today' ? 'text-blue-600' : 'text-gray-900'}`}>{groupName}</h3>
                                    <span className="text-xs font-bold text-gray-400 bg-white px-2 py-1 rounded-full border border-gray-100">
                                        {groupPosts.length}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 px-2">
                                    {groupPosts.map(post => (
                                        <PostListItem 
                                            key={post.id} 
                                            post={post} 
                                            isSelected={selectedPostIds.has(post.id)}
                                            onToggleSelect={(e) => toggleSelection(e, post.id)}
                                            onClick={() => onNavigate('creator', { postId: post.id })}
                                            showDate={true}
                                            compact={false}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    
                    {Object.values(agendaGroups).every((g: any) => g.length === 0) && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60 min-h-[400px]">
                             <Filter className="w-16 h-16 mb-4 stroke-1 text-gray-300" />
                             <p className="text-lg font-medium text-gray-500">No posts found.</p>
                             <p className="text-sm">Try adjusting your filters or search.</p>
                             <button onClick={clearFilters} className="mt-4 text-blue-600 font-bold hover:underline">Clear Filters</button>
                        </div>
                    )}
                </div>
            </div>
        )}

      </div>

      {/* 4. Floating Bulk Actions Bar */}
      {selectedPostIds.size > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1d1d1f] text-white p-2 pl-4 rounded-2xl shadow-2xl z-50 flex items-center gap-4 animate-in slide-in-from-bottom-6 zoom-in-95 duration-300 border border-white/10 ring-1 ring-black/5">
              <div className="flex items-center gap-3 border-r border-gray-700 pr-4">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-[10px] font-bold ring-2 ring-[#1d1d1f]">
                      {selectedPostIds.size}
                  </div>
                  <span className="text-xs font-bold text-gray-300 hidden sm:inline">Selected</span>
              </div>

              <div className="flex items-center gap-1">
                  <BulkActionButton 
                      icon={CheckCircle2} label="Approve" 
                      onClick={() => performBulkAction('Approve')} color="text-green-400 hover:bg-white/10" 
                  />
                   <BulkActionButton 
                      icon={CalendarRange} label="+1 Day" 
                      onClick={() => performBulkAction('MoveDay')} color="text-blue-400 hover:bg-white/10" 
                  />
                  <BulkActionButton 
                      icon={RotateCcw} label="Draft" 
                      onClick={() => performBulkAction('Draft')} color="text-yellow-400 hover:bg-white/10" 
                  />
                   <BulkActionButton 
                      icon={Copy} label="Duplicate" 
                      onClick={() => performBulkAction('Duplicate')} color="text-purple-400 hover:bg-white/10" 
                  />
                  <div className="w-px h-6 bg-gray-700 mx-2"></div>
                  <BulkActionButton 
                      icon={Trash2} label="Delete" 
                      onClick={() => performBulkAction('Delete')} color="text-red-500 hover:bg-red-500/20" 
                  />
              </div>
              
              <button onClick={() => setSelectedPostIds(new Set())} className="ml-2 p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-4 h-4 text-gray-400" />
              </button>
          </div>
      )}
    </div>
  );
};

// --- Sub-components ---

const BulkActionButton: React.FC<{ icon: any, label: string, onClick: () => void, color: string }> = ({ icon: Icon, label, onClick, color }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all ${color} group relative`}
        title={label}
    >
        <Icon className="w-5 h-5" strokeWidth={2} />
        <span className="sr-only">{label}</span>
        {/* Tooltip */}
        <span className="absolute -top-10 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">
            {label}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
        </span>
    </button>
);

const PostListItem: React.FC<{ post: Post, isSelected: boolean, onToggleSelect: (e: any) => void, onClick: () => void, showDate?: boolean, compact?: boolean }> = ({ post, isSelected, onToggleSelect, onClick, showDate, compact = true }) => {
    const statusConfig = STATUS_CONFIG[post.status];
    const StatusIcon = statusConfig.icon;
    const isBot = post.author !== 'User';
    
    return (
        <div 
            onClick={onClick}
            className={`
                group relative bg-white rounded-2xl border transition-all cursor-pointer overflow-hidden
                ${isSelected ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/10' : 'border-gray-100 hover:border-blue-200 hover:shadow-md'}
                ${compact ? 'p-3' : 'p-4'}
            `}
        >
             {/* Status Stripe */}
             <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusConfig.bg.replace('bg-', 'bg-').replace('50', '400')}`}></div>
             
             <div className="pl-3 flex gap-3">
                 {/* Checkbox */}
                 <div 
                    onClick={onToggleSelect}
                    className={`
                        w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-all shrink-0 mt-0.5
                        ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-200 bg-white text-transparent opacity-0 group-hover:opacity-100'}
                    `}
                 >
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />
                 </div>

                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                             <div className="flex -space-x-1">
                                {post.platforms.map(p => (
                                    <div key={p} className="bg-white rounded-full p-0.5 border border-gray-100 shadow-sm z-10 relative">
                                        <PlatformIcon platform={p} size={12} />
                                    </div>
                                ))}
                             </div>
                             {showDate && (
                                 <span className="text-[10px] font-bold text-gray-500 uppercase bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                     {new Date(post.scheduledFor).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                                 </span>
                             )}
                             <span className="text-[10px] font-bold text-gray-400 uppercase">
                                {new Date(post.scheduledFor).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </span>
                        </div>
                        <div className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                            <StatusIcon className="w-3 h-3" /> 
                            <span className={compact ? "hidden xl:inline" : ""}>{statusConfig.label}</span>
                        </div>
                    </div>
                    
                    <p className={`font-semibold text-gray-800 line-clamp-2 leading-snug ${compact ? 'text-xs' : 'text-sm mb-2'}`}>
                        {post.content}
                    </p>

                    <div className="flex justify-between items-center pt-2 mt-1 border-t border-gray-50">
                        <div className="flex items-center gap-1.5">
                            {isBot ? (
                                <Bot className="w-3 h-3 text-purple-500" />
                            ) : (
                                <User className="w-3 h-3 text-gray-400" />
                            )}
                            <span className="text-[10px] font-medium text-gray-400">
                                {isBot ? 'AI Agent' : 'Manual'}
                            </span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                 </div>
             </div>
        </div>
    );
};
