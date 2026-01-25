
import React from 'react';
import { User, Shield } from 'lucide-react';

const Team = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Team & Governance</h1>
      </header>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex gap-4">
          <button className="text-sm font-bold text-blue-600 border-b-2 border-blue-600 pb-2">Members</button>
          <button className="text-sm font-bold text-gray-500 hover:text-gray-700 pb-2">Roles</button>
          <button className="text-sm font-bold text-gray-500 hover:text-gray-700 pb-2">Audit Log</button>
        </div>
        
        <div className="divide-y divide-gray-100">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">Team Member {i}</p>
                  <p className="text-xs text-gray-500">member{i}@contentcaster.io</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1">
                  <Shield size={12} /> Admin
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team;
