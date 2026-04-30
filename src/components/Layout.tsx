import React from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { ClipboardList } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  
  return (
    <div className="flex flex-col h-screen w-full bg-[#0A0B0D] text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 lg:px-8 bg-[#111318] shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">TaskSchedule</span>
        </div>
        <div className="flex items-center space-x-4 lg:space-x-6">
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{profile?.name || 'User'}</p>
              <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold leading-none mt-1">{profile?.role || 'Member'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-900 border-2 border-indigo-500 flex items-center justify-center font-bold text-indigo-200 shrink-0">
              {profile?.name?.substring(0, 2).toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#0A0B0D]">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
