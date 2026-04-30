import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, CheckSquare, Folder, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: Folder },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  ];

  return (
    <nav className="w-60 bg-[#0E1015] border-r border-slate-800 p-6 flex flex-col space-y-8 shrink-0 overflow-y-auto">
      <div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Main Menu</p>
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer',
                    isActive 
                      ? 'text-indigo-400 bg-indigo-400/10' 
                      : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-auto pt-8 border-t border-slate-800/60">
        <button
          onClick={signOut}
          className="flex w-full items-center justify-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
