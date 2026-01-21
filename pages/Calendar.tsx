import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, X, Clock, CheckCircle, ChevronDown, Image as ImageIcon, Trash2, ChevronUp } from 'lucide-react';
import { store } from '../services/mockStore';
import { Post, Platform, PostStatus, MediaItem } from '../types';
import { PlatformIcon } from '../components/PlatformIcon';
import { MediaPicker } from '../components/MediaPicker';

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  
  // Custom Time State
  const [timeState, setTimeState] = useState({ hour: '09', minute: '00', period: 'AM' });
  const [isTimeOpen, setIsTimeOpen] = useState(false);

  // Platform Dropdown State
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(Platform.Twitter);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Media State
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const fetchedPosts = await store.getPosts();
    setPosts(fetchedPosts);
  };

  // Calendar Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    setSelectedDate(clickedDate);
    setIsModalOpen(true);
    setNewPostContent('');
    setSelectedMedia(null);
    setIsDropdownOpen(false);
    setTimeState({ hour: '09', minute: '00', period: 'AM' }); // Reset time default
  };

  const handleQuickSchedule = async () => {
    // Allow scheduling if there is content OR media
    if (!selectedDate || (!newPostContent && !selectedMedia)) return;

    // Convert 12h time to 24h for Date object
    let hours = parseInt(timeState.hour);
    const minutes = parseInt(timeState.minute);
    
    if (timeState.period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (timeState.period === 'AM' && hours === 12) {
      hours = 0;
    }

    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(hours, minutes, 0, 0);

    const newPost: Post = {
      id: Date.now().toString(),
      content: newPostContent,
      platforms: [selectedPlatform],
      scheduledFor: scheduledDateTime.toISOString(),
      status: PostStatus.Scheduled,
      generatedByAi: false,
      mediaUrl: selectedMedia?.url,
    };

    try {
      await store.addPost(newPost);
      await loadPosts();
      setIsModalOpen(false);
      alert('Post scheduled successfully!');
    } catch (error) {
      console.error("Failed to schedule post:", error);
      alert("Failed to schedule post. Please try again.");
    }
  };

  const getPostsForDay = (day: number) => {
    return posts.filter(post => {
      const d = new Date(post.scheduledFor);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const getPlatformStyles = (platform: Platform) => {
    switch (platform) {
      case Platform.Twitter: return 'bg-sky-100 border-sky-200 text-sky-800 hover:bg-sky-200';
      case Platform.Facebook: return 'bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200';
      case Platform.Instagram: return 'bg-pink-100 border-pink-200 text-pink-800 hover:bg-pink-200';
      case Platform.LinkedIn: return 'bg-indigo-100 border-indigo-200 text-indigo-800 hover:bg-indigo-200';
      case Platform.YouTube: return 'bg-red-100 border-red-200 text-red-800 hover:bg-red-200';
      case Platform.Discord: return 'bg-violet-100 border-violet-200 text-violet-800 hover:bg-violet-200';
      case Platform.Threads: return 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200';
      default: return 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
    }
  };

  // Generate Grid Cells
  const renderCalendarCells = () => {
    const cells = [];
    const previousMonthDays = new Date(year, month, 0).getDate();

    // Previous month padding
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(
        <div key={`prev-${i}`} className="h-32 bg-slate-50 border border-slate-100 p-2 opacity-50 text-slate-400">
          {previousMonthDays - firstDayOfMonth + 1 + i}
        </div>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayPosts = getPostsForDay(day);
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

      cells.push(
        <div 
          key={day} 
          onClick={() => handleDateClick(day)}
          className={`h-32 border border-slate-200 p-2 relative group hover:bg-slate-50 transition-colors cursor-pointer ${isToday ? 'bg-blue-50/30' : 'bg-white'}`}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
              {day}
            </span>
            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 rounded text-blue-600 transition-all">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-1 overflow-y-auto max-h-[calc(100%-30px)] custom-scrollbar">
            {dayPosts.map(post => {
              const platform = post.platforms[0];
              return (
                <div 
                  key={post.id} 
                  className={`text-xs p-1.5 rounded border truncate flex items-center gap-1.5 shadow-sm transition-colors ${getPlatformStyles(platform)}`}
                  title={`${platform}: ${post.content}`}
                >
                  <div className="shrink-0">
                    <PlatformIcon platform={platform} size={14} />
                  </div>
                  <span className="truncate font-medium">{post.content}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return cells;
  };

  // Generate Time Options
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            Content Calendar
          </h1>
          <p className="text-slate-500">Plan and schedule your social media presence.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-md text-slate-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-lg font-semibold text-slate-800 w-32 text-center select-none">
            {monthNames[month]} {year}
          </span>
          <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-md text-slate-600">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Calendar Grid Header */}
      <div className="grid grid-cols-7 bg-slate-900 text-white rounded-t-xl overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-3 text-center text-sm font-semibold uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid Body */}
      <div className="grid grid-cols-7 border-l border-b border-slate-200 flex-1 bg-slate-200 gap-px shadow-sm rounded-b-xl overflow-hidden">
        {renderCalendarCells()}
      </div>

      {/* Quick Schedule Modal */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Schedule Post
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                <div className="font-medium text-slate-900 bg-slate-100 px-3 py-2.5 rounded-lg border border-slate-200">
                   {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Custom Time Picker */}
                <div className="relative">
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Time</label>
                   <button
                     type="button"
                     onClick={() => setIsTimeOpen(!isTimeOpen)}
                     className="w-full bg-slate-800 text-white p-2.5 rounded-lg border border-slate-700 flex items-center justify-between hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                   >
                     <span className="font-mono text-lg tracking-wide">
                        {timeState.hour}:{timeState.minute} <span className="text-slate-400 text-sm">{timeState.period}</span>
                     </span>
                     <Clock className="w-4 h-4 text-slate-400" />
                   </button>
                   
                   {isTimeOpen && (
                     <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl p-2 grid grid-cols-3 gap-1 animate-in fade-in zoom-in-95">
                        <div className="max-h-32 overflow-y-auto custom-scrollbar">
                          {hours.map(h => (
                            <div 
                              key={h} 
                              onClick={() => setTimeState(prev => ({...prev, hour: h}))}
                              className={`text-center py-1 rounded cursor-pointer text-sm ${timeState.hour === h ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                            >
                              {h}
                            </div>
                          ))}
                        </div>
                        <div className="max-h-32 overflow-y-auto custom-scrollbar border-l border-r border-slate-100">
                          {minutes.map(m => (
                            <div 
                              key={m} 
                              onClick={() => setTimeState(prev => ({...prev, minute: m}))}
                              className={`text-center py-1 rounded cursor-pointer text-sm ${timeState.minute === m ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                            >
                              {m}
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-col gap-1">
                           {['AM', 'PM'].map(p => (
                             <div 
                               key={p} 
                               onClick={() => {
                                 setTimeState(prev => ({...prev, period: p}));
                                 setIsTimeOpen(false);
                               }}
                               className={`flex-1 flex items-center justify-center rounded cursor-pointer text-xs font-bold ${timeState.period === p ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                             >
                               {p}
                             </div>
                           ))}
                        </div>
                     </div>
                   )}
                </div>

                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Platform</label>
                   <div className="relative">
                     <button
                       type="button"
                       onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                       className="w-full pl-9 p-2.5 text-left border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white flex items-center justify-between"
                     >
                       <span className="text-slate-900 text-sm font-medium truncate">{selectedPlatform}</span>
                       <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                     </button>

                     <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <PlatformIcon platform={selectedPlatform} size={16} />
                     </div>

                     {isDropdownOpen && (
                       <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                         {Object.values(Platform).map(p => (
                           <button
                             key={p}
                             type="button"
                             onClick={() => {
                               setSelectedPlatform(p);
                               setIsDropdownOpen(false);
                             }}
                             className={`w-full px-3 py-2.5 flex items-center gap-3 text-left text-sm transition-colors border-b border-slate-50 last:border-0 ${
                               selectedPlatform === p 
                                 ? 'bg-blue-50 text-blue-700' 
                                 : 'text-slate-700 hover:bg-slate-50'
                             }`}
                           >
                             <PlatformIcon platform={p} size={16} />
                             <span className="font-medium">{p}</span>
                             {selectedPlatform === p && <CheckCircle className="w-3.5 h-3.5 ml-auto text-blue-600" />}
                           </button>
                         ))}
                       </div>
                     )}
                   </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Content</label>
                <textarea 
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="What do you want to post?"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px] text-slate-800"
                ></textarea>
              </div>

              {/* Attach Media Section */}
              <div>
                 <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Attachment</label>
                 {selectedMedia ? (
                   <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 group">
                      {selectedMedia.type === 'image' ? (
                        <img src={selectedMedia.url} alt="Attachment" className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center bg-slate-100 text-slate-400">
                           <span className="text-xs font-mono uppercase">Video Attached</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button 
                            onClick={() => setSelectedMedia(null)}
                            className="bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 hover:bg-red-700"
                         >
                            <Trash2 className="w-3 h-3" /> Remove
                         </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1 px-2 text-[10px] text-white truncate">
                        {selectedMedia.name}
                      </div>
                   </div>
                 ) : (
                   <button 
                     onClick={() => setIsMediaPickerOpen(true)}
                     className="w-full h-12 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                   >
                     <ImageIcon className="w-4 h-4" />
                     <span className="text-sm font-medium">Attach Image or Video</span>
                   </button>
                 )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
               <button 
                 onClick={handleQuickSchedule}
                 disabled={!newPostContent && !selectedMedia}
                 className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-900/10"
               >
                 <CheckCircle className="w-4 h-4" />
                 Confirm Schedule
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPicker 
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(media) => setSelectedMedia(media)}
      />
    </div>
  );
};