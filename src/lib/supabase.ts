/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Fallback to the requested credentials if not overridden in .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dgqxoguogzakauhxlgci.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_uzopnd1h39LMQtvsRcOdEQ_Sdqh6kk5';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Provide a distinct storage key if needed or rely on robust fetching
    storage: window.localStorage,
  }
});

// Shared database types
export type UserRole = 'Admin' | 'Member';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  admin_id: string;
  created_at: string;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface Task {
  id: string;
  title: string;
  description: string;
  project_id: string;
  assigned_to: string;
  status: TaskStatus;
  priority?: string;
  deadline: string;
  created_at: string;
  updated_at?: string;
}
