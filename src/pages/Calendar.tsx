import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { store } from '../services/mockStore';
import { Post, PageProps } from '../types';

export const Calendar: React.FC<PageProps> = ({ onNavigate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    store.getPosts().then(setPosts);
  }, []);

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-8rem)] flex flex-col">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Calendar</h1>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded-lg"><ChevronLeft size={20} /></button>
            <span className="font-bold text-lg">{format(currentDate, 'MMMM yyyy')}</span>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded-lg"><ChevronRight size={20} /></button>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('creator', { date: new Date().toISOString() })}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> Schedule Post
        </button>
      </header>

      <div className="flex-1 bg-white rounded-[32px] shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="p-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">{d}</div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 auto-rows-fr">
          {days.map((day, i) => {
            const dayPosts = posts.filter(p => isSameDay(new Date(p.scheduledFor), day));
            return (
              <div key={i} className="border-r border-b border-gray-100 p-2 min-h-[100px] hover:bg-gray-50 transition-colors relative group">
                <span className={`text-sm font-bold ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full' : 'text-gray-700'}`}>
                  {format(day, 'd')}
                </span>
                <div className="mt-2 space-y-1">
                  {dayPosts.map(post => (
                    <div 
                      key={post.id} 
                      onClick={() => onNavigate('creator', { postId: post.id })}
                      className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100 truncate font-medium cursor-pointer hover:bg-blue-100"
                    >
                      {post.content}
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => onNavigate('creator', { date: day.toISOString() })}
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded text-gray-500"
                >
                  <Plus size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;