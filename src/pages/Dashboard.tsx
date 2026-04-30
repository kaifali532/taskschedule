import React, { useEffect, useState } from 'react';
import { supabase, Task } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { isPast, parseISO } from 'date-fns';

export default function Dashboard() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) fetchTasks();
  }, [profile]);

  const fetchTasks = async () => {
    try {
      let query = supabase.from('tasks').select('*');
      if (profile?.role === 'Member') query = query.eq('assigned_to', profile.id);
      const { data, error } = await query;
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const pendingTasks = tasks.filter(t => t.status !== 'Done').length;
  const overdueTasks = tasks.filter(t => t.deadline && isPast(parseISO(t.deadline)) && t.status !== 'Done').length;

  return (
    <div className="flex flex-col w-full h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#16191F] border border-slate-800 p-5 rounded-xl">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Tasks</p>
          <h3 className="text-3xl font-bold text-white">{totalTasks}</h3>
        </div>
        <div className="bg-[#16191F] border border-slate-800 p-5 rounded-xl">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Completed</p>
          <h3 className="text-3xl font-bold text-white">{completedTasks}</h3>
          <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all" 
              style={{ width: `${totalTasks ? Math.round((completedTasks/totalTasks)*100) : 0}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-[#16191F] border border-slate-800 p-5 rounded-xl">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Pending</p>
          <h3 className="text-3xl font-bold text-white">{pendingTasks}</h3>
          <p className="mt-2 text-[10px] text-amber-400/80">Active work items</p>
        </div>
        <div className={`bg-[#16191F] border border-slate-800 p-5 rounded-xl ${overdueTasks > 0 ? 'border-l-4 border-l-rose-500' : ''}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${overdueTasks > 0 ? 'text-rose-400' : 'text-slate-500'}`}>Overdue</p>
          <h3 className="text-3xl font-bold text-white">{overdueTasks}</h3>
          {(overdueTasks > 0) && <p className="mt-2 text-[10px] text-rose-400/60">Immediate action needed</p>}
        </div>
      </div>

      <div className="flex-1 bg-[#111318] border border-slate-800 rounded-2xl flex flex-col overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Recent Tasks</h2>
        </div>
        
        <div className="flex-1 overflow-x-auto">
          {tasks.length > 0 ? (
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-[#1A1D23]/50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Task Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {tasks.slice(0, 8).map(task => (
                  <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">
                      <div>{task.title}</div>
                      {task.description && <div className="text-xs text-slate-500 mt-1 truncate max-w-sm">{task.description}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {task.status === 'Done' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-bold border border-emerald-500/20">DONE</span>
                      ) : task.status === 'In Progress' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[11px] font-bold border border-amber-500/20">IN PROGRESS</span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[11px] font-bold border border-blue-500/20">TO DO</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 ${task.deadline && isPast(parseISO(task.deadline)) && task.status !== 'Done' ? 'text-rose-400' : 'text-slate-400'}`}>
                      {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-sm text-slate-500">No tasks found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
