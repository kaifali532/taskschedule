import { supabase } from '../lib/supabase';
import type { Project, Task, UserProfile } from '../lib/supabase';

export const api = {
  async getTasks(userId: string, role?: string): Promise<Task[]> {
    try {
      let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (role === 'Member') {
        query = query.eq('assigned_to', userId);
      }
      const { data, error } = await query;
      if (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error('getTasks error:', err);
      return [];
    }
  },

  async getProjects(userId: string, role?: string): Promise<Project[]> {
    try {
      const query = supabase.from('projects').select('*').order('created_at', { ascending: false });
      const { data, error } = await query;
      if (error) {
        console.error('Error fetching projects:', error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error('getProjects error:', err);
      return [];
    }
  },

  async getUsers(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error('getUsers error:', err);
      return [];
    }
  },

  async createTask(task: Partial<Task>): Promise<Task | null> {
    try {
      const { data, error } = await supabase.from('tasks').insert([task]).select().single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('createTask error:', err);
      throw err;
    }
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    try {
      const { error } = await supabase.from('tasks').update(updates).eq('id', taskId);
      if (error) throw error;
    } catch (err) {
      console.error('updateTask error:', err);
      throw err;
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
    } catch (err) {
      console.error('deleteTask error:', err);
      throw err;
    }
  },

  async createProject(project: Partial<Project>): Promise<Project | null> {
    try {
      const { data, error } = await supabase.from('projects').insert([project]).select().single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('createProject error:', err);
      throw err;
    }
  },

  async deleteProject(projectId: string): Promise<void> {
    try {
      await supabase.from('tasks').delete().eq('project_id', projectId);
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) throw error;
    } catch (err) {
      console.error('deleteProject error:', err);
      throw err;
    }
  }
};
