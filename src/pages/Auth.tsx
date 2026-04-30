import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckSquare } from 'lucide-react';

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
    <div className="min-h-screen bg-[#fbfbfd] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans animate-in">
      <div className="sm:mx-auto sm:w-full sm:max-w-[420px] flex flex-col items-center relative z-10">
        <div className="w-12 h-12 bg-black rounded-[14px] flex items-center justify-center mb-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
          <CheckSquare className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-center text-[28px] font-semibold tracking-tight text-[#1d1d1f] mb-2">
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h2>
        <p className="text-center text-[15px] text-[#86868b]">
          {isLogin ? 'Sign in to access your workspace' : 'Join TaskSchedule to manage projects'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[420px]">
        <div className="outer-card">
          <span className="glow-layer"></span>
          <span className="glow-layer blur-strong"></span>
          <div className="card-internal py-10 px-6 sm:px-10 h-full">
            <form className="space-y-5 relative z-10" onSubmit={handleAuth}>
              {error && (
                <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm text-center border border-red-100">
                  {error}
                </div>
              )}
              
              {!isLogin && (
                <div className="space-y-4 text-left">
                  <div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="block w-full rounded-xl bg-gray-50 border border-gray-200 py-3.5 px-4 text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-[15px] transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <div className="relative">
                    <select
                      id="role"
                      name="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'Member' | 'Admin')}
                      className="block w-full rounded-xl bg-gray-50 border border-gray-200 py-3.5 px-4 text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-[15px] transition-all appearance-none"
                    >
                      <option value="Member">Team Member</option>
                      <option value="Admin">Administrator</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
            )}
            
            <div className="space-y-4">
              <div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="block w-full rounded-xl bg-gray-50 border border-gray-200 py-3.5 px-4 text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-[15px] transition-all placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="block w-full rounded-xl bg-gray-50 border border-gray-200 py-3.5 px-4 text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-[15px] transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 rounded-full text-[15px] font-semibold text-white bg-[#1d1d1f] hover:bg-black focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] shadow-sm hover:shadow-md"
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center border-t border-gray-100 pt-6 relative z-10">
            <p className="text-[14px] text-gray-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                className="font-medium text-[#1d1d1f] hover:text-blue-600 transition-colors"
              >
                {isLogin ? 'Create one now' : 'Sign in instead'}
              </button>
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
