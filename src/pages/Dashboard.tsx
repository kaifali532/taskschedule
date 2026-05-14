import React, { useEffect, useState } from 'react';
import { supabase, Task } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { isPast, parseISO } from 'date-fns';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) fetchTasks();
  }, [profile]);

  const fetchTasks = async () => {
    try {
      let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (profile?.role === 'Member') {
         query = query.eq('assigned_to', profile.id);
      }
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
      <div className="flex flex-col w-full animate-pulse">
        <div className="mb-8">
          <div className="h-8 w-48 bg-zinc-800 rounded-md mb-2"></div>
          <div className="h-4 w-64 bg-zinc-800 rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="outer-card h-[120px]">
              <div className="card-internal p-6">
                <div className="h-3 w-20 bg-zinc-800 rounded-md mb-4"></div>
                <div className="h-10 w-16 bg-zinc-800 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { totalTasks, completedTasks, pendingTasks, overdueTasks, completionPercentage } = React.useMemo(() => {
    const total = tasks.length;
    let completed = 0;
    let pending = 0;
    let overdue = 0;

    for (const t of tasks) {
      if (t.status === 'Done') {
        completed++;
      } else {
        pending++;
        if (t.deadline && isPast(parseISO(t.deadline))) {
          overdue++;
        }
      }
    }

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: pending,
      overdueTasks: overdue,
      completionPercentage: percentage
    };
  }, [tasks]);

  return (
    <div className="flex flex-col w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Hi, {profile?.name?.split(' ')[0]}</h1>
        <p className="text-[15px] text-zinc-400">Here's an overview of your tasks.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
        <div className="outer-card">
          <span className="glow-layer"></span>
          <span className="glow-layer blur-strong"></span>
          <div className="card-internal p-6">
            <p className="text-zinc-400 text-[12px] font-semibold uppercase tracking-wider mb-2">Total Tasks</p>
            <h3 className="text-[40px] leading-none font-bold tracking-tight text-white">{totalTasks}</h3>
          </div>
        </div>
        
        <div className="outer-card">
          <span className="glow-layer"></span>
          <span className="glow-layer blur-strong"></span>
          <div className="card-internal p-6 flex flex-col justify-between">
            <div>
              <p className="text-zinc-400 text-[12px] font-semibold uppercase tracking-wider mb-2">Completed</p>
              <h3 className="text-[40px] leading-none font-bold tracking-tight text-white">{completedTasks}</h3>
            </div>
            <div className="mt-4 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="outer-card">
          <span className="glow-layer"></span>
          <span className="glow-layer blur-strong"></span>
          <div className="card-internal p-6">
            <p className="text-zinc-400 text-[12px] font-semibold uppercase tracking-wider mb-2">Pending</p>
            <h3 className="text-[40px] leading-none font-bold tracking-tight text-white">{pendingTasks}</h3>
          </div>
        </div>

        <div className="outer-card">
          <span className="glow-layer"></span>
          <span className="glow-layer blur-strong"></span>
          <div className={`card-internal p-6 ${overdueTasks > 0 ? 'bg-red-500/10 border-red-500/20' : ''}`}>
            <p className={`text-[12px] font-semibold uppercase tracking-wider mb-2 ${overdueTasks > 0 ? 'text-red-400' : 'text-zinc-400'}`}>Overdue</p>
            <h3 className="text-[40px] leading-none font-bold tracking-tight text-white">{overdueTasks}</h3>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-[20px] font-semibold tracking-tight text-white">Recent Activity</h2>
        <Link to="/tasks" className="text-[14px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
          View all <ArrowRight className="w-4 h-4 ml-0.5" />
        </Link>
      </div>
      
      <div className="bg-[#18181b] border border-white/5 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.2)] overflow-hidden">
        {tasks.length > 0 ? (
          <div className="divide-y divide-white/5">
            {tasks.slice(0, 5).map(task => (
              <div key={task.id} className="p-5 sm:px-6 hover:bg-white/5 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="mt-0.5">
                    {task.status === 'Done' ? (
                       <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                       <div className={`w-5 h-5 rounded-full border-2 ${task.status === 'In Progress' ? 'border-amber-400 border-t-amber-200' : 'border-zinc-500'}`}></div>
                    )}
                  </div>
                  <div>
                    <h4 className={`text-[15px] font-medium transition-colors ${task.status === 'Done' ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-[13px] text-zinc-400 mt-0.5 line-clamp-1 max-w-sm sm:max-w-md">{task.description}</p>
                    )}
                  </div>
                </div>
                <div className="hidden sm:block">
                  <span className={`inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                    task.status === 'Done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    task.status === 'In Progress' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                    'bg-slate-500/10 text-slate-300 border-slate-500/20'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-[15px] text-zinc-400 font-medium">No tasks yet.</p>
            <p className="text-[14px] text-zinc-500 mt-1">Get started by creating a new task.</p>
          </div>
        )}
      </div>
    </div>
  );
}
