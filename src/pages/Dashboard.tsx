import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Task, Project } from '../lib/supabase';
import { isPast, parseISO, format } from 'date-fns';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let fallbackTimeout: NodeJS.Timeout;

    const fetchData = async () => {
      if (!profile) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        
        fallbackTimeout = setTimeout(() => {
          if (mounted && loading) {
            setLoading(false);
            console.error("Dashboard data fetch timeout");
          }
        }, 5000);

        console.log("Fetching dashboard data for", profile.id);
        const [tasksData, projectsData] = await Promise.all([
          api.getTasks(profile.id, profile.role),
          api.getProjects(profile.id, profile.role)
        ]);
        console.log("Finished fetching dashboard data");

        if (mounted) {
          setTasks(tasksData || []);
          setProjects(projectsData || []);
        }
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        if (mounted) setError('Failed to load dashboard data.');
      } finally {
        clearTimeout(fallbackTimeout);
        if (mounted) setLoading(false);
      }
    };
    
    fetchData();
    
    return () => { 
      mounted = false; 
      clearTimeout(fallbackTimeout);
    };
  }, [profile?.id, profile?.role]);

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    let completed = 0;
    let pending = 0;
    let overdue = 0;

    tasks.forEach(t => {
      if (t.status === 'Done') completed++;
      else {
        pending++;
        if (t.deadline && isPast(parseISO(t.deadline))) overdue++;
      }
    });

    return { totalTasks, completed, pending, overdue };
  }, [tasks]);

  const tasksByStatus = useMemo(() => {
    return [
      { name: 'To Do', value: tasks.filter(t => t.status === 'To Do').length, color: '#64748b' },
      { name: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, color: '#f59e0b' },
      { name: 'Done', value: tasks.filter(t => t.status === 'Done').length, color: '#10b981' }
    ].filter(d => d.value > 0);
  }, [tasks]);

  const tasksByProject = useMemo(() => {
    if (!projects.length) return [];
    return projects.map(p => {
      return {
        name: p.name,
        Tasks: tasks.filter(t => t.project_id === p.id).length
      };
    }).filter(p => p.Tasks > 0).slice(0, 5); // top 5
  }, [tasks, projects]);

  const tasksOverTime = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach(t => {
      if (t.created_at) {
        const date = format(parseISO(t.created_at), 'MMM dd');
        counts[date] = (counts[date] || 0) + 1;
      }
    });
    return Object.keys(counts).sort().map(date => ({
      date,
      Tasks: counts[date]
    })).slice(-14);
  }, [tasks]);

  if (loading) {
    return (
      <div className="flex flex-col h-[50vh] items-center justify-center gap-4">
        <div className="flex space-x-2">
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"></div>
          <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce delay-150"></div>
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce delay-300"></div>
        </div>
        <span className="text-zinc-400 font-medium text-sm">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
        <h3 className="font-bold mb-1">Error loading data</h3>
        <p className="text-sm opacity-90">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Dashboard</h1>
        <p className="text-zinc-400">Welcome back, {profile?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Projects" value={projects.length} />
        <StatCard title="Total Tasks" value={stats.totalTasks} />
        <StatCard title="Completed" value={stats.completed} valueColor="text-emerald-400" />
        <StatCard title="Pending" value={stats.pending} valueColor={stats.overdue > 0 ? "text-red-400" : "text-amber-400"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#18181b] border border-white/5 rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-white mb-6">Task Status Breakdown</h2>
          <div className="h-[300px] w-full">
            {tasksByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tasksByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {tasksByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-500">No tasks data available.</div>
            )}
          </div>
        </div>

        <div className="bg-[#18181b] border border-white/5 rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-white mb-6">Tasks per Project</h2>
          <div className="h-[300px] w-full">
            {tasksByProject.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tasksByProject}>
                  <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="Tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-500">No project tasks available.</div>
            )}
          </div>
        </div>

        <div className="bg-[#18181b] border border-white/5 rounded-2xl p-6 shadow-lg lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-6">Tasks Over Time (Created)</h2>
          <div className="h-[300px] w-full">
             {tasksOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tasksOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                    <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="Tasks" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#18181b', stroke: '#10b981', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#10b981' }} />
                  </LineChart>
                </ResponsiveContainer>
             ) : (
                <div className="flex h-full items-center justify-center text-zinc-500">No activity history available.</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, valueColor = "text-white" }: { title: string, value: number, valueColor?: string }) {
  return (
    <div className="bg-[#18181b] border border-white/5 rounded-2xl p-6 shadow-lg shadow-black/20">
      <h3 className="text-zinc-400 text-sm font-medium mb-3">{title}</h3>
      <p className={`text-3xl font-bold tracking-tight ${valueColor}`}>{value}</p>
    </div>
  );
}
