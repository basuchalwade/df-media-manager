
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout: React.FC = () => {
  return (
    <div className="flex w-full h-screen overflow-hidden bg-[#F5F5F7]">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-7xl mx-auto pb-20">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
