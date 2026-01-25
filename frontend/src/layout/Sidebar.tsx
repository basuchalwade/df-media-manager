
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, PenTool, Calendar, Bot, Image, 
  BarChart3, Settings, Cast, Users, Link, Target 
} from 'lucide-react';

const Sidebar = () => {
  const sections = [
    {
      title: 'Workspace',
      items: [
        { label: 'Overview', to: '/overview', icon: LayoutDashboard },
        { label: 'Campaigns', to: '/campaigns', icon: Target },
        { label: 'Creator Studio', to: '/creator', icon: PenTool },
        { label: 'Media Library', to: '/media', icon: Image },
        { label: 'Calendar', to: '/calendar', icon: Calendar },
      ]
    },
    {
      title: 'Automation',
      items: [
        { label: 'Bot Manager', to: '/bots', icon: Bot },
        { label: 'Analytics', to: '/analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'System',
      items: [
        { label: 'Integrations', to: '/integrations', icon: Link },
        { label: 'Team', to: '/users', icon: Users },
        { label: 'Settings', to: '/settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-64 h-screen bg-[#F5F5F7]/80 backdrop-blur-md border-r border-gray-200 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 pb-2 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">
          <Cast size={18} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="font-bold text-gray-900 text-[15px] leading-tight">ContentCaster</h1>
          <p className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Enterprise AI</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6 custom-scrollbar">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:bg-white/50 hover:text-gray-900'}
                  `}
                >
                  <item.icon size={18} strokeWidth={2} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-black/5 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 shadow-sm" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-900">Admin User</span>
            <span className="text-[10px] text-gray-500 font-medium">Pro Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
