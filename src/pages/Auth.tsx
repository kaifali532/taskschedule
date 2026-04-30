import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, User, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Member' | 'Admin'>('Member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role,
            },
          },
        });
        if (error) throw error;
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
      
      {/* subtle layered background gradients for a premium feel */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
         <div className="w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px] opacity-60"></div>
         <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[100px] opacity-40"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[480px] flex flex-col items-center relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center text-center mb-10 w-full"
        >
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-bold text-[56px] sm:text-[72px] tracking-tighter leading-none text-white mb-2"
          >
            Ethara.Ai
          </motion.h1>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[20px] sm:text-[28px] font-medium text-zinc-300 tracking-tight leading-tight mb-8"
          >
            TaskSchedule
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          >
            <h3 className="text-[18px] sm:text-[22px] font-medium text-zinc-100 mb-3 tracking-tight">
              Organize Your Work. Simplify Your Life.
            </h3>
            <p className="text-[14px] sm:text-[16px] text-zinc-400 font-light max-w-[340px] mx-auto leading-relaxed">
              Manage projects, assign tasks, and track progress effortlessly.
            </p>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full mt-4"
        >
          <div className="outer-card w-full">
            <span className="glow-layer"></span>
            <span className="glow-layer blur-strong"></span>
            <div className="card-internal py-10 px-6 sm:px-10 h-full w-full">
              
              <div className="mb-8 text-center bg-transparent">
                <h4 className="text-[20px] font-semibold tracking-tight text-white mb-1.5">
                  {isLogin ? 'Welcome back' : 'Create an account'}
                </h4>
                <p className="text-[14px] text-zinc-400">
                  {isLogin ? 'Sign in to access your workspace' : 'Join Ethara.Ai to get started'}
                </p>
              </div>

              <form className="space-y-5 relative z-10" onSubmit={handleAuth}>
                {error && (
                  <div className="bg-red-500/10 text-red-400 p-3.5 rounded-xl text-sm text-center border border-red-500/20">
                    {error}
                  </div>
                )}
                
                {!isLogin && (
                  <div className="space-y-4 text-left">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        className="block w-full rounded-xl bg-zinc-900/80 border border-white/10 py-3.5 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-[15px] transition-all placeholder:text-zinc-500 hover:border-white/20"
                      />
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                        <Briefcase className="h-5 w-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                      </div>
                      <select
                        id="role"
                        name="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'Member' | 'Admin')}
                        className="block w-full rounded-xl bg-zinc-900/80 border border-white/10 py-3.5 pl-11 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-[15px] transition-all appearance-none hover:border-white/20"
                      >
                        <option value="Member">Team Member</option>
                        <option value="Admin">Administrator</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
              )}
              
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="block w-full rounded-xl bg-zinc-900/80 border border-white/10 py-3.5 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-[15px] transition-all placeholder:text-zinc-500 hover:border-white/20"
                  />
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="block w-full rounded-xl bg-zinc-900/80 border border-white/10 py-3.5 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-[15px] transition-all placeholder:text-zinc-500 hover:border-white/20"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 rounded-full text-[15px] font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)]"
                >
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  {isLogin ? 'Sign In' : 'Create Account'}
                </button>
              </div>
            </form>
            
            <div className="mt-8 text-center border-t border-white/10 pt-6 relative z-10">
              <p className="text-[14px] text-zinc-400">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setError(null); }}
                  className="font-medium text-white hover:text-indigo-400 transition-colors ml-1"
                >
                  {isLogin ? 'Create one now' : 'Sign in instead'}
                </button>
              </p>
            </div>
          </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
