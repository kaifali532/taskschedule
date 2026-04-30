import React, { useEffect, useState } from 'react';
import { supabase, Task } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { isPast, parseISO } from 'date-fns';
import { ArrowRight, CircleIcon, CheckCircle2 } from 'lucide-react';
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
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const pendingTasks = tasks.filter(t => t.status !== 'Done').length;
  const overdueTasks = tasks.filter(t => t.deadline && isPast(parseISO(t.deadline)) && t.status !== 'Done').length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] mb-1">Hi, {profile?.name?.split(' ')[0]}</h1>
        <p className="text-[15px] text-[#86868b]">Here's an overview of your tasks.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
        <div className="bg-white border border-gray-100 p-6 rounded-[22px] shadow-[0_4px_24px_rgba(0,0,0,0.025)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
          <p className="text-[#86868b] text-[12px] font-semibold uppercase tracking-wider mb-2">Total Tasks</p>
          <h3 className="text-[40px] leading-none font-bold tracking-tight text-[#1d1d1f]">{totalTasks}</h3>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-[22px] shadow-[0_4px_24px_rgba(0,0,0,0.025)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
          <p className="text-[#86868b] text-[12px] font-semibold uppercase tracking-wider mb-2">Completed</p>
          <h3 className="text-[40px] leading-none font-bold tracking-tight text-[#1d1d1f]">{completedTasks}</h3>
          <div className="mt-4 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-black h-full rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-[22px] shadow-[0_4px_24px_rgba(0,0,0,0.025)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
          <p className="text-[#86868b] text-[12px] font-semibold uppercase tracking-wider mb-2">Pending</p>
          <h3 className="text-[40px] leading-none font-bold tracking-tight text-[#1d1d1f]">{pendingTasks}</h3>
        </div>
        <div className={`bg-white border p-6 rounded-[22px] shadow-[0_4px_24px_rgba(0,0,0,0.025)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 ${overdueTasks > 0 ? 'border-red-100 bg-red-50/10' : 'border-gray-100'}`}>
          <p className={`text-[12px] font-semibold uppercase tracking-wider mb-2 ${overdueTasks > 0 ? 'text-red-500' : 'text-[#86868b]'}`}>Overdue</p>
          <h3 className="text-[40px] leading-none font-bold tracking-tight text-[#1d1d1f]">{overdueTasks}</h3>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-[20px] font-semibold tracking-tight text-[#1d1d1f]">Recent Activity</h2>
        <Link to="/tasks" className="text-[14px] font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
          View all <ArrowRight className="w-4 h-4 ml-0.5" />
        </Link>
      </div>
      
      <div className="bg-white border border-gray-100 rounded-[22px] shadow-[0_4px_24px_rgba(0,0,0,0.025)] overflow-hidden">
        {tasks.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {tasks.slice(0, 5).map(task => (
              <div key={task.id} className="p-5 sm:px-6 hover:bg-gray-50/50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="mt-0.5">
                    {task.status === 'Done' ? (
                       <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                       <div className={`w-5 h-5 rounded-full border-2 ${task.status === 'In Progress' ? 'border-orange-400 border-t-orange-200' : 'border-gray-300'}`}></div>
                    )}
                  </div>
                  <div>
                    <h4 className={`text-[15px] font-medium transition-colors ${task.status === 'Done' ? 'text-gray-400 line-through' : 'text-[#1d1d1f]'}`}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-[13px] text-gray-500 mt-0.5 line-clamp-1 max-w-sm sm:max-w-md">{task.description}</p>
                    )}
                  </div>
                </div>
                <div className="hidden sm:block">
                  <span className={`inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                    task.status === 'Done' ? 'bg-green-50 text-green-600 border-green-100' : 
                    task.status === 'In Progress' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                    'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-[15px] text-gray-500 font-medium">No tasks yet.</p>
            <p className="text-[14px] text-gray-400 mt-1">Get started by creating a new task.</p>
          </div>
        )}
      </div>
    </div>
  );
}
