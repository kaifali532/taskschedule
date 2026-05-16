import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, UserProfile } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Supabase auth error:', error.message);
          if (error.message?.includes('Refresh Token') || error.message?.includes('Failed to fetch')) {
            // Force sign out and clear session if token is invalid or network error blocks validation
            await supabase.auth.signOut().catch(() => {});
            if (mounted) {
               setSession(null);
               setProfile(null);
               setIsLoading(false);
            }
            return;
          }
        }
        
        if (!mounted) return;

        setSession(session);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (err: any) {
        console.warn('Auth initialization exception:', err);
        if (err?.message?.includes('Refresh Token') || err?.message?.includes('Failed to fetch')) {
            await supabase.auth.signOut().catch(() => {});
            if (mounted) {
               setSession(null);
               setProfile(null);
            }
        }
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      if (event === 'INITIAL_SESSION') return; // We handle initial session above
      
      setSession(newSession);
      
      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }

      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setSession(null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string, retries = 3) => {
    try {
      let data = null;
      let error = null;
      
      for (let i = 0; i < retries; i++) {
        const res = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
          
        data = res.data;
        error = res.error;
        
        if (!error && data) break;
        
        // Wait before retrying (gives DB triggers time to finish on signup)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      if (error) {
        console.error('Error fetching user profile:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Unexpected error in fetchProfile:', err);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, profile, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
