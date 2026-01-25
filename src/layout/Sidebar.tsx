
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PenTool, Calendar, Bot, Image, BarChart3, Settings, Cast } from 'lucide-react';

const Sidebar: React.FC = () => {
  const links = [
    { to: '/overview', icon: LayoutDashboard, label: 'Overview' },
    { to: '/creator', icon: PenTool, label: 'Creator Studio' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/bots', icon: Bot, label: 'Bot Manager' },
    { to: '/media', icon: Image, label: 'Media Library' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-[260px] h-screen bg-[#F5F5F7]/80 backdrop-blur-md border-r border-gray-200 flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">
          <Cast size={18} />
        </div>
        <div>
          <h1 className="font-bold text-gray-900 tracking-tight">ContentCaster</h1>
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Enterprise AI</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-white/50 hover:text-gray-900'}
            `}
          >
            <link.icon size={18} strokeWidth={2} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gray-200" />
          <div className="text-xs">
            <p className="font-bold text-gray-900">Admin User</p>
            <p className="text-gray-500">Pro Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
