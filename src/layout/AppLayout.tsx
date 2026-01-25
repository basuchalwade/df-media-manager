
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1d1d1f] font-sans flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 min-h-screen overflow-y-auto custom-scrollbar">
        <div className="max-w-[1400px] mx-auto pb-20">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
