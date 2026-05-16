import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Logo } from './Logo';

function Navbar() {
  const { signOut, profile } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Projects', path: '/projects' },
    { name: 'Tasks', path: '/tasks' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/5 backdrop-blur-lg border-b border-white/10 shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all flex-none">
      <div className="max-w-7xl mx-auto py-4 px-8">
        <div className="flex justify-between items-center h-12">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex flex-col justify-center group transition-all">
              <span className="font-bold text-xl tracking-tight leading-none bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent transition-opacity duration-300 group-hover:opacity-80">EThara.Ai</span>
            </Link>
            <nav className="hidden md:flex gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "font-medium transition-all text-[15px]",
                    location.pathname === link.path 
                     ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
                     : "text-zinc-400 hover:text-indigo-400"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
               <div className="text-right flex flex-col justify-center">
                 <p className="text-[14px] font-semibold text-white leading-tight">{profile?.name || 'User'}</p>
                 <p className="text-[12px] text-zinc-300 font-medium leading-tight mt-0.5">{profile?.role || 'Member'}</p>
               </div>
               <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                 {(profile?.name?.[0] || 'U').toUpperCase()}
               </div>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/10"></div>
            <button
              onClick={signOut}
              className="hidden md:flex text-[14px] font-medium text-zinc-400 hover:text-red-400 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors items-center gap-2"
              title="Sign Out"
            >
              <span>Logout</span>
              <LogOut className="w-4 h-4" />
            </button>
            <button className="md:hidden text-white p-2" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-[#09090b]/95 backdrop-blur-xl absolute w-full shadow-lg pb-4 px-4 pt-2">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-xl text-[15px] font-medium transition-colors",
                  location.pathname === link.path ? "bg-zinc-800/50 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t border-zinc-800">
               <button
                 onClick={() => { setIsOpen(false); signOut(); }}
                 className="w-full text-left px-4 py-3 text-[15px] font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors flex items-center justify-between"
               >
                 <span>Sign Out</span>
                 <LogOut className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-purple-500/30 flex flex-col relative overflow-hidden">
      {/* Background Watermark */}
      <div className="fixed inset-0 z-0 pointer-events-none flex flex-col items-center justify-start pt-[20vh] select-none mix-blend-screen">
        <h1 className="text-[12vw] sm:text-[140px] font-medium tracking-tight leading-none animate-pulse-glow">Ethara.Ai</h1>
        <p className="text-[4vw] sm:text-[40px] font-light tracking-widest mt-2 sm:mt-4 text-zinc-400 opacity-[0.02] uppercase">TeamTaskSchedule</p>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Navbar />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-in fade-in duration-500 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
};
