
import React, { useEffect, useState } from 'react';
import { store } from '../services/mockStore';
import { Post } from '../types';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    store.getPosts().then(setPosts);
  }, []);

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setCurrentMonth(addDays(currentMonth, -30))} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft /></button>
          <button onClick={() => setCurrentMonth(addDays(currentMonth, 30))} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight /></button>
        </div>
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        const dayPosts = posts.filter(p => isSameDay(new Date(p.scheduledFor), cloneDay));

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[120px] p-2 border-b border-r border-gray-100 relative bg-white transition-colors hover:bg-gray-50
              ${!isSameMonth(day, monthStart) ? 'text-gray-300 bg-gray-50/50' : ''}
            `}
          >
            <span className="text-sm font-semibold">{formattedDate}</span>
            <div className="mt-2 space-y-1">
              {dayPosts.map(post => (
                <div key={post.id} className="text-[10px] p-1.5 bg-blue-50 text-blue-700 rounded border border-blue-100 truncate font-medium">
                  {post.content}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border-t border-l border-gray-100 rounded-2xl overflow-hidden shadow-sm">{rows}</div>;
  };

  return (
    <div className="animate-in fade-in">
      {renderHeader()}
      {renderCells()}
    </div>
  );
};

export default Calendar;
