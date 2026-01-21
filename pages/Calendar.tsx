import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, 
  Eye, Filter, LayoutList, Grid3X3,
  Globe
} from 'lucide-react';
import { store } from '../services/mockStore';
import { Post, Platform, PostStatus, PageProps } from '../types';
import { PlatformIcon } from '../components/PlatformIcon';

// --- Constants & Helpers ---

const TIMEZONES = [
  { label: 'New York (EST)', value: 'America/New_York' },
  { label: 'Los Angeles (PST)', value: 'America/Los_Angeles' },
  { label: 'London (GMT)', value: 'Europe/London' },
  { label: 'India (IST)', value: 'Asia/Kolkata' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Sydney (AEDT)', value: 'Australia/Sydney' },
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

export const Calendar: React.FC<PageProps> = ({ onNavigate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Filter & View State
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<PostStatus | 'All'>('All');
  const [viewMode, setViewMode] = useState<'Month' | 'Agenda'>('Month');
  
  // Timezone - Auto detect system default
  const systemTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [selectedTimezone, setSelectedTimezone] = useState(systemTz);

  // Drag & Drop State
  const [draggedPost, setDraggedPost] = useState<Post | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

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
    onNavigate('creator', { date: dateToUse.toISOString() });
  };

  const handleEditPost = (post: Post) => {
    onNavigate('creator', { postId: post.id });
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
               {/* Agenda View Content */}
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
           {/* Sidebar Timeline Content */}
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
                 
                 {/* Status Filter Row */}
                 <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar items-center pl-6">
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
                        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-blue-100 p-3 transition-colors">
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
    </div>
  );
};
