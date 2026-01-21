import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, X, Clock, CheckCircle } from 'lucide-react';
import { store } from '../services/mockStore';
import { Post, Platform, PostStatus } from '../types';

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTime, setNewPostTime] = useState('09:00');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(Platform.Twitter);

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
  };

  const handleQuickSchedule = async () => {
    if (!selectedDate || !newPostContent) return;

    // Construct ISO string with selected time
    const [hours, minutes] = newPostTime.split(':').map(Number);
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(hours, minutes, 0, 0);

    const newPost: Post = {
      id: Date.now().toString(),
      content: newPostContent,
      platforms: [selectedPlatform],
      scheduledFor: scheduledDateTime.toISOString(),
      status: PostStatus.Scheduled,
      generatedByAi: false,
    };

    await store.addPost(newPost);
    await loadPosts();
    setIsModalOpen(false);
    alert('Post scheduled successfully!');
  };

  const getPostsForDay = (day: number) => {
    return posts.filter(post => {
      const d = new Date(post.scheduledFor);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
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
            {dayPosts.map(post => (
              <div key={post.id} className={`text-xs p-1.5 rounded border truncate ${
                post.status === PostStatus.Published 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                <div className="flex items-center gap-1 mb-0.5">
                   <span className="font-bold text-[10px] uppercase opacity-75">{post.platforms[0]}</span>
                </div>
                {post.content}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return cells;
  };

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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Schedule Post
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                <div className="font-medium text-slate-900 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
                   {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Time</label>
                   <input 
                     type="time" 
                     value={newPostTime}
                     onChange={(e) => setNewPostTime(e.target.value)}
                     className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                   />
                </div>
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Platform</label>
                   <select 
                     value={selectedPlatform}
                     onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
                     className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                   >
                     {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
                   </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Content</label>
                <textarea 
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="What do you want to post?"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px]"
                ></textarea>
              </div>

              <button 
                onClick={handleQuickSchedule}
                disabled={!newPostContent}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
