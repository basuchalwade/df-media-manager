import React from 'react';
import { LayoutDashboard, PenTool, Calendar, Settings, Bot, BarChart3, Cast, Users, Link, Image } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const menuItems = [
    { section: 'Workspace', items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'creator', label: 'Creator Studio', icon: PenTool },
      { id: 'media', label: 'Media Library', icon: Image },
      { id: 'calendar', label: 'Calendar', icon: Calendar },
    ]},
    { section: 'Automation', items: [
      { id: 'bots', label: 'Bot Manager', icon: Bot },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ]},
    { section: 'System', items: [
      { id: 'integrations', label: 'Integrations', icon: Link },
      { id: 'users', label: 'Team', icon: Users },
      { id: 'settings', label: 'Settings', icon: Settings },
    ]}
  ];

  return (
    <div className="w-[260px] h-full flex flex-col flex-shrink-0 bg-[#F5F5F7]/80 backdrop-blur-2xl border-r border-black/5 select-none">
      {/* Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 via-purple-600 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Cast className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-[15px] font-bold tracking-tight text-[#1d1d1f] leading-none">ContentCaster</h1>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">by DOSSIEFOYER</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 custom-scrollbar">
        {menuItems.map((group, idx) => (
          <div key={idx}>
            <h3 className="px-3 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{group.section}</h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 apple-ease group ${
                      isActive 
                        ? 'bg-black/5 text-black' // Subtle gray selection like macOS Finder
                        : 'text-gray-500 hover:bg-black/5 hover:text-black'
                    }`}
                  >
                    <Icon 
                      className={`w-[18px] h-[18px] ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} 
                      strokeWidth={isActive ? 2.5 : 2} 
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User / Footer */}
      <div className="p-4 border-t border-black/5">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-black/5 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 shadow-sm border border-white/20"></div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-900 truncate">Admin User</p>
            <p className="text-[11px] text-gray-500 truncate">Pro Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
};