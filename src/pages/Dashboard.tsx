import React, { useEffect, useState } from 'react';
import { supabase, Task } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { isPast, parseISO, format } from 'date-fns';
import { ArrowRight, CheckCircle2, Clock, LayoutDashboard, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { demoTasks, demoActivity } from '../lib/demoData';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { motion } from 'motion/react';

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
      
      // Fallback to demo data
      setTasks(data && data.length > 0 ? data : demoTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks(demoTasks); // Fallback on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[400px] flex-col space-y-8 p-6">
        <div className="h-10 w-48 bg-white/5 animate-pulse rounded-md"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 animate-pulse rounded-[24px]"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="h-64 bg-white/5 animate-pulse rounded-[24px]"></div>
           <div className="h-64 bg-white/5 animate-pulse rounded-[24px]"></div>
        </div>
      </div>
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const pendingTasks = tasks.filter(t => t.status === 'To Do').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const overdueTasks = tasks.filter(t => t.deadline && isPast(parseISO(t.deadline)) && t.status !== 'Done').length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const pieData = [
    { name: 'Completed', value: completedTasks, color: '#34d399' },
    { name: 'In Progress', value: inProgressTasks, color: '#fbbf24' },
    { name: 'Pending', value: pendingTasks, color: '#94a3b8' }
  ];

  // Group tasks by project (mocking project names if missing) for bar chart
  const projectCounts: Record<string, number> = {};
  tasks.forEach(t => {
    const pName = (t as any).project?.name || `Project ${t.project_id?.substring(0,4) || 'Unassigned'}`;
    projectCounts[pName] = (projectCounts[pName] || 0) + 1;
  });
  const barData = Object.entries(projectCounts).slice(0, 5).map(([name, count]) => ({ name: name.substring(0, 12) + '...', count }));

  // Line chart data (tasks completed over time, mocked if needed)
  const lineData = [
    { name: 'Mon', completed: Math.floor(completedTasks * 0.2) },
    { name: 'Tue', completed: Math.floor(completedTasks * 0.35) },
    { name: 'Wed', completed: Math.floor(completedTasks * 0.5) },
    { name: 'Thu', completed: Math.floor(completedTasks * 0.7) },
    { name: 'Fri', completed: Math.floor(completedTasks * 0.85) },
    { name: 'Sat', completed: completedTasks },
  ];

  return (
    <div className="flex flex-col w-full space-y-8 relative">
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8"/>
            <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.2}/>
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a855f7"/>
            <stop offset="100%" stopColor="#6366f1"/>
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Hi, {profile?.name?.split(' ')[0] || 'User'}</h1>
        <p className="text-[15px] text-zinc-400">Here's an overview of your workspace.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          whileHover={{ y: -5 }}
          className="relative overflow-hidden bg-[#0a0a0f]/80 backdrop-blur-2xl border border-indigo-500/10 rounded-[24px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-indigo-200/60 text-[12px] font-semibold uppercase tracking-wider mb-2">Total Tasks</p>
              <h3 className="text-[40px] leading-none font-bold tracking-tight text-white glow-text drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{totalTasks}</h3>
            </div>
            <div className="bg-indigo-500/10 p-3 rounded-2xl text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
               <LayoutDashboard className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ y: -5 }}
          className="relative overflow-hidden bg-[#0a0a0f]/80 backdrop-blur-2xl border border-emerald-500/10 rounded-[24px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-emerald-200/60 text-[12px] font-semibold uppercase tracking-wider mb-2">Completed</p>
                <h3 className="text-[40px] leading-none font-bold tracking-tight text-white glow-text drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{completedTasks}</h3>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                 <CheckSquare className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 w-full bg-black/50 h-1.5 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }} animate={{ width: `${completionPercentage}%` }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]" 
              ></motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          whileHover={{ y: -5 }}
          className="relative overflow-hidden bg-[#0a0a0f]/80 backdrop-blur-2xl border border-amber-500/10 rounded-[24px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-amber-200/60 text-[12px] font-semibold uppercase tracking-wider mb-2">In Progress</p>
              <h3 className="text-[40px] leading-none font-bold tracking-tight text-white glow-text drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{inProgressTasks}</h3>
            </div>
            <div className="bg-amber-500/10 p-3 rounded-2xl text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
               <Clock className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ y: -5 }}
          className={`relative overflow-hidden bg-[#0a0a0f]/80 backdrop-blur-2xl border ${overdueTasks > 0 ? 'border-red-500/20' : 'border-rose-500/10'} rounded-[24px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] group`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${overdueTasks > 0 ? 'from-red-500/10' : 'from-rose-500/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
               <p className={`text-[12px] font-semibold uppercase tracking-wider mb-2 ${overdueTasks > 0 ? 'text-red-400' : 'text-rose-200/60'}`}>Overdue</p>
               <h3 className="text-[40px] leading-none font-bold tracking-tight text-white glow-text drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{overdueTasks}</h3>
            </div>
            {overdueTasks > 0 && (
               <div className="bg-red-500/20 p-3 rounded-2xl text-red-500 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse">
                  <Clock className="w-6 h-6" />
               </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Pie Chart */}
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-6 relative overflow-hidden group"
         >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <h2 className="text-[18px] font-semibold text-white mb-6 relative z-10">Task Status Distribution</h2>
            <motion.div 
               animate={{ y: [0, -5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
               style={{ width: '100%', height: 300, minHeight: 300 }} className="relative z-10"
            >
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none" cornerRadius={6} isAnimationActive={true} animationDuration={1500}>
                        {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} filter="url(#glow)" />
                        ))}
                     </Pie>
                     <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ fill: 'transparent' }}
                     />
                  </PieChart>
               </ResponsiveContainer>
            </motion.div>
            <div className="flex justify-center gap-6 mt-2 relative z-10">
               {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}` }}></div>
                     <span className="text-[13px] text-zinc-300 font-medium tracking-wide">{entry.name}</span>
                  </div>
               ))}
            </div>
         </motion.div>

         {/* Bar Chart */}
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-6 relative overflow-hidden group"
         >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <h2 className="text-[18px] font-semibold text-white mb-6 relative z-10">Tasks per Project</h2>
            <motion.div 
               animate={{ y: [0, -5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               style={{ width: '100%', height: 300, minHeight: 300, marginTop: 24 }} className="relative z-10"
            >
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                     <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                     <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                     <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                        contentStyle={{ backgroundColor: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
                     />
                     <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={1500} />
                  </BarChart>
               </ResponsiveContainer>
            </motion.div>
         </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Line Chart */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="lg:col-span-2 bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-6 relative overflow-hidden group"
         >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <h2 className="text-[18px] font-semibold text-white mb-6 relative z-10">Progress Overview</h2>
            <motion.div 
               animate={{ y: [0, -4, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
               style={{ width: '100%', height: 300, minHeight: 300 }} className="relative z-10"
            >
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                     <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                     <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
                     />
                     <Line type="monotone" dataKey="completed" stroke="url(#lineGradient)" strokeWidth={4} dot={{ r: 5, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, fill: '#fff', stroke: '#8b5cf6', strokeWidth: 2 }} isAnimationActive={true} animationDuration={2000} />
                  </LineChart>
               </ResponsiveContainer>
            </motion.div>
         </motion.div>

         {/* Activity Feed */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-6 relative overflow-hidden group"
         >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <h2 className="text-[18px] font-semibold text-white mb-6 relative z-10">Recent Activity</h2>
            <div className="space-y-6 relative z-10">
               {demoActivity.slice(0, 5).map((act, i) => (
                  <motion.div 
                     initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.8 + (i * 0.1) }}
                     key={act.id} className="flex gap-4 relative"
                  >
                     {i !== demoActivity.slice(0, 5).length - 1 && (
                        <div className="absolute left-4 top-10 bottom-[-24px] w-[2px] bg-gradient-to-b from-indigo-500/30 to-transparent"></div>
                     )}
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex-shrink-0 flex items-center justify-center text-[12px] font-bold text-white border border-[#18181b] shadow-[0_0_10px_rgba(99,102,241,0.5)] z-10">
                        {act.user.charAt(0)}
                     </div>
                     <div>
                        <p className="text-[14px] text-zinc-200 leading-snug font-medium tracking-wide">{act.text}</p>
                        <p className="text-[12px] text-zinc-500 mt-1 uppercase tracking-wider">
                           {isPast(parseISO(act.time)) ? format(parseISO(act.time), 'MMM d, h:mm a') : 'Just now'}
                        </p>
                     </div>
                  </motion.div>
               ))}
            </div>
         </motion.div>
      </div>
      
      <div className="flex items-center justify-between mb-2 px-1 mt-4">
        <h2 className="text-[20px] font-semibold tracking-tight text-white">Latest Tasks</h2>
        <Link to="/tasks" className="text-[14px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
          View all <ArrowRight className="w-4 h-4 ml-0.5" />
        </Link>
      </div>
      
      <div className="bg-[#18181b] border border-white/5 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.2)] overflow-hidden mb-10">
        {tasks.length > 0 ? (
          <div className="divide-y divide-white/5">
            {tasks.slice(0, 5).map((task) => (
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
                <div className="hidden sm:flex items-center gap-3">
                  <div className="flex items-center gap-1">
                     {((task as any).assignee?.name) && (
                        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[9px] font-bold text-zinc-400">
                           {((task as any).assignee.name).substring(0, 2).toUpperCase()}
                        </div>
                     )}
                  </div>
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
