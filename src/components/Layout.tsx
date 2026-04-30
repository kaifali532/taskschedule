import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, CheckSquare } from 'lucide-react';
import { cn } from '../lib/utils';

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
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 border-b border-gray-200/60 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-[#1d1d1f] hover:opacity-80 transition-opacity">
              <CheckSquare className="w-5 h-5 text-black" />
              <span className="font-semibold text-lg tracking-tight">TaskSchedule</span>
            </Link>
            <nav className="hidden md:flex gap-6 mt-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "text-[13px] font-medium transition-colors",
                    location.pathname === link.path ? "text-[#1d1d1f]" : "text-[#86868b] hover:text-[#1d1d1f]"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-3">
               <div className="text-right">
                 <p className="text-[13px] font-medium text-[#1d1d1f] leading-tight">{profile?.name || 'User'}</p>
                 <p className="text-[11px] text-[#86868b] font-medium leading-tight mt-0.5">{profile?.role || 'Member'}</p>
               </div>
            </div>
            <div className="hidden md:block w-px h-5 bg-gray-200"></div>
            <button
              onClick={signOut}
              className="hidden md:flex text-[13px] font-medium text-[#86868b] hover:text-black items-center gap-1.5 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button className="md:hidden text-[#1d1d1f] p-2 -mr-2" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl absolute w-full shadow-lg pb-4 px-4 pt-2">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-xl text-[15px] font-medium transition-colors",
                  location.pathname === link.path ? "bg-gray-100/50 text-[#1d1d1f]" : "text-[#86868b] hover:bg-gray-50 hover:text-[#1d1d1f]"
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t border-gray-100">
               <button
                 onClick={() => { setIsOpen(false); signOut(); }}
                 className="w-full text-left px-4 py-3 text-[15px] font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-between"
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
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] font-sans selection:bg-blue-200/50 flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
};
