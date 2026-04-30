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
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#09090b]/80 border-b border-white/10 transition-all">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex justify-between items-center h-[72px]">
          {/* Left Section */}
          <div className="flex-1 flex items-center justify-start">
            <Link to="/" className="flex flex-col justify-center group transition-all">
              <span className="font-bold text-[24px] tracking-tight leading-none text-white transition-opacity duration-300 group-hover:opacity-80">Ethara.Ai</span>
              <span className="text-[15px] font-medium text-zinc-400 tracking-wide leading-none mt-1">TeamTaskSchedule</span>
            </Link>
          </div>
          
          {/* Center Section */}
          <nav className="hidden md:flex flex-none items-center justify-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "text-[16px] font-medium transition-all duration-300 hover:text-white relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-white after:transition-all",
                  location.pathname === link.path ? "text-white after:w-full" : "text-zinc-400 after:w-0 hover:after:w-full"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          {/* Right Section */}
          <div className="flex-1 flex items-center justify-end gap-5">
            <div className="hidden md:flex items-center gap-3">
               <div className="text-right">
                 <p className="text-[15px] font-medium text-white leading-tight">{profile?.name || 'User'}</p>
                 <p className="text-[14px] text-zinc-400 font-medium leading-tight mt-0.5">{profile?.role || 'Member'}</p>
               </div>
            </div>
            <div className="hidden md:block w-px h-6 bg-zinc-800"></div>
            <button
              onClick={signOut}
              className="hidden md:flex text-[15px] font-medium text-zinc-400 hover:text-white items-center gap-1.5 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
            <button className="md:hidden text-white p-2 -mr-2" onClick={() => setIsOpen(!isOpen)}>
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
      <div className="fixed inset-0 z-0 pointer-events-none flex flex-col items-center justify-start pt-[20vh] select-none opacity-[0.02] mix-blend-screen">
        <h1 className="text-[12vw] sm:text-[140px] font-medium tracking-tight leading-none text-white">Ethara.Ai</h1>
        <p className="text-[4vw] sm:text-[40px] font-light tracking-widest mt-2 sm:mt-4 text-zinc-400 uppercase">TeamTaskSchedule</p>
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
