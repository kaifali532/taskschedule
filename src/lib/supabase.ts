import { createClient } from '@supabase/supabase-js';

// Fallback to the requested credentials if not overridden in .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dgqxoguogzakauhxlgci.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_uzopnd1h39LMQtvsRcOdEQ_Sdqh6kk5';

export const supabase = createClient(supabaseUrl, supabaseKey);

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
  deadline: string;
  created_at: string;
}
