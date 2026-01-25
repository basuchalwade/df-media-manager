
import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { store } from '../services/mockStore';

const Calendar = () => {
  const today = new Date();
  const days = eachDayOfInterval({
    start: startOfMonth(today),
    end: endOfMonth(today),
  });

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-8rem)] flex flex-col">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Calendar</h1>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-200 rounded-lg"><ChevronLeft size={20} /></button>
            <span className="font-bold text-lg">{format(today, 'MMMM yyyy')}</span>
            <button className="p-2 hover:bg-gray-200 rounded-lg"><ChevronRight size={20} /></button>
          </div>
        </div>
        <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
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
            const posts = store.posts.filter(p => isSameDay(new Date(p.date), day));
            return (
              <div key={i} className="border-r border-b border-gray-100 p-2 min-h-[100px] hover:bg-gray-50 transition-colors relative group">
                <span className={`text-sm font-bold ${isSameDay(day, today) ? 'bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full' : 'text-gray-700'}`}>
                  {format(day, 'd')}
                </span>
                <div className="mt-2 space-y-1">
                  {posts.map(post => (
                    <div key={post.id} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100 truncate font-medium">
                      {post.content}
                    </div>
                  ))}
                </div>
                <button className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded text-gray-500">
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
